const wsRCO = require("./wsRCO");
const { RcoFormation } = require("../../../../common/model/index");
const { diff } = require("deep-object-diff");
const { pick } = require("lodash");
const { asyncForEach, chunkedAsyncForEach } = require("../../../../common/utils/asyncUtils");
const report = require("../../../../logic/reporter/report");
const config = require("config");
const { paginator } = require("../../../../common/utils/paginator");
const { storeByChunks } = require("../../../../common/utils/reportUtils");
const crypto = require("crypto");
const { rcoFormationSchema } = require("../../../../common/model/schema");

class Importer {
  constructor() {
    this.added = [];
    this.updated = [];
    this.formationsToAddToDb = [];
    this.formationsToUpdateToDb = [];
  }

  async run(importDay = "") {
    const formations = await wsRCO.getRCOcatalogue(importDay); // "-j-1"
    if (!formations?.length) {
      throw new Error("rco: empty data");
    }

    const dbCount = await RcoFormation.countDocuments({ published: true });

    console.log("Nb formations J : ", formations.length);
    console.log("Nb formations published in DB : ", dbCount);

    const uuidReport = await this.start(formations);
    return uuidReport;
  }

  async start(formations) {
    try {
      const collection = await this.lookupDiff(formations);

      if (!collection) {
        await this.report(formations.length);
        return null;
      }

      const addedFormations = await this.addedFormationsHandler(collection.added);
      this.addtoDbTasks(addedFormations);

      const updatedFormations = await this.updatedFormationsHandler(collection.updated);
      this.addtoDbTasks(updatedFormations);

      // Desactiver la formations
      const deletedFormations = await this.deletedFormationsHandler(collection.deleted);
      this.addtoDbTasks(deletedFormations);

      await this.dbOperationsHandler();

      const uuid = await this.report(formations.length);
      return uuid;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async report(formationsJCount) {
    this.updated.forEach((element) => {
      const { updates, updateInfo } = this.formationsToUpdateToDb.find((u) => u.rcoFormation._id === element.mnaId);

      if (updates && updates.periode) {
        updates.periode = Object.values(updates.periode).map((dateStr) => {
          const formattedDate = new Date(dateStr).toLocaleString("fr-FR", { month: "long", year: "numeric" });
          return formattedDate === "Invalid Date" ? dateStr : formattedDate;
        });
      }

      element.updates = JSON.stringify(updates);

      if (updateInfo.published === true) {
        element.published = "Re-ouverte";
      } else if (updateInfo.published === false) {
        element.published = "Supprimée";
      }
    });

    // eslint-disable-next-line no-unused-vars
    const added = this.added.map(({ mnaId, ...i }) => ({ ...i }));
    const deleted = this.updated
      // eslint-disable-next-line no-unused-vars
      .map(({ mnaId, ...i }) => ({ ...i }))
      .filter(({ published }) => published === "Supprimée");
    const justUpdated = this.updated
      // eslint-disable-next-line no-unused-vars
      .map(({ mnaId, ...i }) => ({ ...i }))
      .filter(({ published }) => published !== "Supprimée");

    const deletedCount = deleted.length;
    const publishedCount = await RcoFormation.countDocuments({ published: true });
    const deactivatedCount = await RcoFormation.countDocuments({ published: false });

    const summary = {
      formationsJCount,
      addedCount: added.length,
      updatedCount: this.updated.length - deletedCount,
      deletedCount,
      publishedCount,
      deactivatedCount,
    };

    // save report in db
    const date = Date.now();
    const type = "rcoImport";

    const uuid = crypto.randomBytes(16).toString("hex");
    await storeByChunks(type, date, summary, "added", added, uuid);
    await storeByChunks(type, date, summary, "updated", justUpdated, uuid);
    await storeByChunks(type, date, summary, "deleted", deleted, uuid);

    const zeroChanges = summary.addedCount === 0 && summary.updatedCount === 0 && deletedCount === 0;

    const link = !zeroChanges ? `${config.publicUrl}/report?type=${type}&date=${date}&id=${uuid}` : null;
    console.log(link); // Useful when send in blue is down

    const data = { added, updated: this.updated, summary, link };
    const title = "[Webservice RCO] Rapport d'importation";
    const to = config.reportMailingList.split(",");
    await report.generate(data, title, to, "rcoReport");
    return uuid;
  }

  /*
   * Reset report
   */
  resetReport() {
    this.formationsToAddToDb = [];
    this.formationsToUpdateToDb = [];
    this.added = [];
    this.updated = [];
  }

  /*
   * Handler db operations
   */
  async dbOperationsHandler() {
    await asyncForEach(this.formationsToAddToDb, async (formationToAddToDb) => {
      await this.addRCOFormation(formationToAddToDb);
    });
    await asyncForEach(this.formationsToUpdateToDb, async (formationToUpdateToDb) => {
      await this.updateRCOFormation(formationToUpdateToDb.rcoFormation, formationToUpdateToDb.updateInfo);
    });
  }

  /*
   * Add db tasks
   */
  addtoDbTasks(resultFormations) {
    this.formationsToAddToDb = [...this.formationsToAddToDb, ...resultFormations.toAddToDb];
    this.formationsToUpdateToDb = [...this.formationsToUpdateToDb, ...resultFormations.toUpdateToDb];
  }

  /*
   * Handler added formation
   */
  async addedFormationsHandler(added) {
    const toAddToDb = [];
    const toUpdateToDb = [];

    if (!added) {
      return {
        toAddToDb,
        toUpdateToDb,
      };
    }

    await asyncForEach(added, async (rcoFormationAdded) => {
      const rcoFormation = await this.getRcoFormation(rcoFormationAdded);

      // The formation does not already exist
      if (!rcoFormation) {
        toAddToDb.push(rcoFormationAdded);
      } else if (!rcoFormation.published) {
        // Réactiver la formation
        let updateInfo = {
          published: true,
        };
        // Compare old with new one
        const { updates, keys } = this.diffRcoFormation(rcoFormation, rcoFormationAdded);
        if (updates) {
          // prepare update
          for (let ite = 0; ite < keys.length; ite++) {
            const key = keys[ite];
            updateInfo[key] = rcoFormationAdded[key];
          }
        }
        toUpdateToDb.push({ rcoFormation, updateInfo, updates });
      } else {
        console.error(
          `addedFormationsHandler >> Formation ${rcoFormationAdded.cle_ministere_educatif} existe et est publiée ${rcoFormation._id}`
        );
      }
    });

    return {
      toAddToDb,
      toUpdateToDb,
    };
  }

  /*
   * Handler updated formation
   */
  async updatedFormationsHandler(updated) {
    const toUpdateToDb = [];

    if (!updated) {
      return {
        toAddToDb: [],
        toUpdateToDb,
      };
    }

    await asyncForEach(updated, async (rcoFormationUpdated) => {
      const rcoFormation = await this.getRcoFormation(rcoFormationUpdated);

      // The formation does exist
      if (rcoFormation) {
        let updateInfo = {};
        // Compare old with new one
        const { updates, keys } = this.diffRcoFormation(rcoFormation, rcoFormationUpdated);
        if (updates) {
          // prepare update
          for (let ite = 0; ite < keys.length; ite++) {
            const key = keys[ite];
            updateInfo[key] = rcoFormationUpdated[key];
          }
          toUpdateToDb.push({ rcoFormation, updateInfo, updates });
        }
      } else {
        console.error(
          `updatedFormationsHandler >> Formation ${rcoFormationUpdated.cle_ministere_educatif} n'existe pas en base`
        );
      }
    });

    return {
      toAddToDb: [],
      toUpdateToDb,
    };
  }

  /*
   * Handler deleted formation
   */
  async deletedFormationsHandler(deleted) {
    const toUpdateToDb = [];

    if (!deleted) {
      return {
        toAddToDb: [],
        toUpdateToDb,
      };
    }
    await asyncForEach(deleted, async (rcoFormation) => {
      let updateInfo = {
        published: false,
      };
      toUpdateToDb.push({ rcoFormation, updateInfo, updates: null });
    });

    return {
      toAddToDb: [],
      toUpdateToDb,
    };
  }

  /*
   * Comparing collections to find diff
   */
  async lookupDiff(currentFormations) {
    const added = [];
    const updated = [];
    const deleted = [];

    console.log("Lookup for new or update trainings");
    await chunkedAsyncForEach(currentFormations, async (formation) => {
      const found = await this.getRcoFormation(formation, true);

      // Some formations has been added
      if (!found) {
        added.push(formation);
      } else {
        const { keys } = this.diffRcoFormation(found, formation);
        // Some formations has been updated
        if (keys.length !== 0) {
          updated.push(formation);
        } else {
          // set last update so that it resets expires for this document
          await RcoFormation.findOneAndUpdate(
            {
              cle_ministere_educatif: formation.cle_ministere_educatif,
            },
            {
              last_update_at: Date.now(),
            }
          );
        }
      }
    });

    console.log("Lookup for deleted trainings");
    // check if Some formations has been deleted
    await paginator(
      RcoFormation,
      {
        filter: { published: true },
        select: "+email +etablissement_gestionnaire_courriel +etablissement_formateur_courriel",
        lean: true,
        showProgress: true,
      },
      async (pastFormation) => {
        const found = currentFormations.some((f) => {
          if (f.cle_ministere_educatif) {
            return f.cle_ministere_educatif === pastFormation.cle_ministere_educatif;
          }
          return false;
        });
        if (!found) {
          deleted.push(pastFormation);
        }
      }
    );

    // No modifications
    if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
      return null;
    }

    return {
      added,
      updated,
      deleted,
    };
  }

  /*
   * get RCO Formation
   */
  async getRcoFormation({ cle_ministere_educatif }, onlyPublished = false) {
    let found;
    if (cle_ministere_educatif) {
      found = await RcoFormation.findOne({
        cle_ministere_educatif,
        ...(onlyPublished ? { published: true } : {}),
      })
        .select("+email +etablissement_gestionnaire_courriel +etablissement_formateur_courriel")
        .lean();
    }

    return found;
  }

  /*
   * Add to db RCO Formation
   */
  async addRCOFormation(rcoFormation) {
    const { id_formation, id_action, id_certifinfo, cle_ministere_educatif } = rcoFormation;
    const newRcoFormation = await RcoFormation.findOneAndUpdate(
      { cle_ministere_educatif },
      {
        ...rcoFormation,
        converted_to_mna: false,
        conversion_error: null,
        id_rco_formation: `${id_formation}|${id_action}|${id_certifinfo}`,
      },
      {
        new: true,
        upsert: true,
        overwrite: true,
      }
    );
    const added = { mnaId: newRcoFormation._id, rcoId: rcoFormation.cle_ministere_educatif };
    this.added.push(added);
    return added;
  }

  /*
   * Update to db RCO Formation
   */
  async updateRCOFormation(rcoFormation, updateInfo) {
    const updates_history = this.buildUpdatesHistory(rcoFormation, updateInfo);
    await RcoFormation.findOneAndUpdate(
      { _id: rcoFormation._id },
      {
        ...rcoFormation,
        ...updateInfo,
        updates_history: updates_history.slice(-100), // keep only the last 100 elements
        last_update_at: Date.now(),
        converted_to_mna: false,
        conversion_error: null,
        id_rco_formation: `${rcoFormation.id_formation}|${rcoFormation.id_action}|${rcoFormation.id_certifinfo}`,
      },
      { new: true }
    );
    const updated = { mnaId: rcoFormation._id, rcoId: rcoFormation.cle_ministere_educatif };
    this.updated.push(updated);
    return updated;
  }

  /*
   * Build updates history
   */
  buildUpdatesHistory(rcoFormation, updateInfo) {
    const from = Object.keys(updateInfo).reduce((acc, key) => {
      acc[key] = rcoFormation[key];
      return acc;
    }, {});
    return [...rcoFormation.updates_history, { from, to: { ...updateInfo }, updated_at: Date.now() }];
  }

  /*
   * diff RCO Formation
   */
  diffRcoFormation(rcoFormationP, formation) {
    /* eslint-disable no-unused-vars */
    const {
      _id,
      __v,
      updates_history,
      published,
      created_at,
      last_update_at,
      converted_to_mna,
      conversion_error,
      id_rco_formation,
      ...rcoFormation
    } = rcoFormationP;

    // ensure to compare only with fields existing in model (if RCO add some fields, it won't trigger many updates)
    const newFormation = pick(formation, Object.keys(rcoFormationSchema));
    const compare = diff(rcoFormation, newFormation);
    const keys = Object.keys(compare);

    if (keys.length === 0) {
      return { updates: null, keys: [] };
    }

    return { updates: compare, keys };
  }
}

const importer = new Importer();
module.exports = importer;
