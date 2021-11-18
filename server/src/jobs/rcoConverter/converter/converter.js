const logger = require("../../../common/logger");
const { RcoFormation, Formation } = require("../../../common/model/index");
const report = require("../../../logic/reporter/report");
const config = require("config");
const { createOrUpdateEtablissements } = require("../../../logic/updaters/etablissementUpdater");

const { paginator } = require("../../../common/utils/paginator");
const { storeByChunks } = require("../../../common/utils/reportUtils");
const {
  findPreviousFormations,
  copyAffelnetFields,
  copyParcoursupFields,
  extractFlatIdsAction,
} = require("./migrationFinder");
const { extractFirstValue } = require("../../../common/utils/rcoUtils");

const extractPeriodeArray = (arr) => {
  return Array.from(new Set(arr.map((v) => v.split("##")).flat()));
};

const extractUsefulNewFields = (formation) => {
  const {
    cle_ministere_educatif,
    etablissement_gestionnaire_courriel,
    etablissement_formateur_courriel,
    niveau_entree_obligatoire,
    entierement_a_distance,
  } = formation;

  return {
    cle_ministere_educatif,
    etablissement_gestionnaire_courriel,
    etablissement_formateur_courriel,
    niveau_entree_obligatoire,
    entierement_a_distance,
  };
};

/**
 * check last updates_history entry on RCOFormation and if only new fields, to_update=false (to spare much time)
 */
const hasOnlyUpdatedNewFields = (rcoFormation) => {
  const newFields = [
    "cle_ministere_educatif",
    "etablissement_gestionnaire_courriel",
    "etablissement_formateur_courriel",
    "intitule_formation",
    "niveau_entree_obligatoire",
    "entierement_a_distance",
  ];
  const updatedFields = Object.keys(rcoFormation?.updates_history[rcoFormation?.updates_history?.length - 1]?.to ?? {});

  return updatedFields.length === newFields.length && updatedFields.every((field) => newFields.includes(field));
};

const formatToMnaFormation = (rcoFormation) => {
  const periode =
    rcoFormation.periode && rcoFormation.periode.length > 0
      ? `[${extractPeriodeArray(rcoFormation.periode).reduce((acc, e) => `${acc}${acc ? ", " : ""}"${e}"`, "")}]`
      : null;

  let niveau_entree_obligatoire = null;
  if (rcoFormation.niveau_entree_obligatoire !== null) {
    const niveauEntreeNbr = Number(rcoFormation.niveau_entree_obligatoire);
    if (!Number.isNaN(niveauEntreeNbr)) {
      niveau_entree_obligatoire = niveauEntreeNbr;
    }
  }

  // TODO intitule, id_formation, emails  --> split stuff separated by ## ?

  return {
    cle_ministere_educatif: rcoFormation.cle_ministere_educatif,
    id_rco_formation: `${rcoFormation.id_formation}|${rcoFormation.id_action}|${rcoFormation.id_certifinfo}`,
    id_formation: rcoFormation.id_formation,
    id_action: rcoFormation.id_action,
    ids_action: extractFlatIdsAction(rcoFormation.id_action),
    id_certifinfo: rcoFormation.id_certifinfo,
    cfd: rcoFormation.cfd,

    uai_formation: rcoFormation.etablissement_lieu_formation_uai,
    code_postal: extractFirstValue(rcoFormation.etablissement_lieu_formation_code_postal),
    code_commune_insee: extractFirstValue(rcoFormation.etablissement_lieu_formation_code_insee),

    lieu_formation_geo_coordonnees: extractFirstValue(rcoFormation.etablissement_lieu_formation_geo_coordonnees),
    lieu_formation_adresse: extractFirstValue(rcoFormation.etablissement_lieu_formation_adresse),
    lieu_formation_siret: rcoFormation.etablissement_lieu_formation_siret,

    rncp_code: rcoFormation.rncp_code,
    periode,
    capacite: rcoFormation.capacite,

    email: rcoFormation.email,
    source: "WS RCO",
    published: rcoFormation.published,
    rco_published: rcoFormation.published,

    etablissement_gestionnaire_siret: rcoFormation.etablissement_gestionnaire_siret,
    etablissement_gestionnaire_uai: rcoFormation.etablissement_gestionnaire_uai,
    etablissement_gestionnaire_adresse: rcoFormation.etablissement_gestionnaire_adresse,
    etablissement_gestionnaire_code_postal: rcoFormation.etablissement_gestionnaire_code_postal,
    etablissement_gestionnaire_code_commune_insee: rcoFormation.etablissement_gestionnaire_code_insee,
    geo_coordonnees_etablissement_gestionnaire: rcoFormation.etablissement_gestionnaire_geo_coordonnees,

    etablissement_formateur_siret: rcoFormation.etablissement_formateur_siret,
    etablissement_formateur_uai: rcoFormation.etablissement_formateur_uai,
    etablissement_formateur_adresse: rcoFormation.etablissement_formateur_adresse,
    etablissement_formateur_code_postal: rcoFormation.etablissement_formateur_code_postal,
    etablissement_formateur_code_commune_insee: rcoFormation.etablissement_formateur_code_insee,
    geo_coordonnees_etablissement_formateur: rcoFormation.etablissement_formateur_geo_coordonnees,

    niveau_entree_obligatoire,
    entierement_a_distance: rcoFormation.entierement_a_distance === "oui",
    etablissement_formateur_courriel: rcoFormation.etablissement_formateur_courriel,
    etablissement_gestionnaire_courriel: rcoFormation.etablissement_gestionnaire_courriel,
  };
};

const getOrCreateFormation = async ({ cle_ministere_educatif, id_rco_formation }) => {
  let cF;
  if (cle_ministere_educatif) {
    cF = await Formation.findOne({
      cle_ministere_educatif,
    });
  }

  if (!cF) {
    cF = await Formation.findOne({
      id_rco_formation,
    });
  }

  if (!cF) {
    cF = new Formation();
  }
  return cF;
};

const createFormation = async (
  rcoFormation,
  mnaFormattedRcoFormation,
  invalidRcoFormations,
  convertedRcoFormations
) => {
  const stateEtablissements = await createOrUpdateEtablissements(rcoFormation._doc);

  if (stateEtablissements.errored) {
    const error = `${stateEtablissements.etablissement_gestionnaire.error} ${stateEtablissements.etablissement_formateur.error}`;
    rcoFormation.conversion_error = error;
    await rcoFormation.save();

    invalidRcoFormations.push({
      cle_ministere_educatif: mnaFormattedRcoFormation.cle_ministere_educatif,
      id_rco_formation: mnaFormattedRcoFormation.id_rco_formation,
      cfd: mnaFormattedRcoFormation.cfd,
      rncp: mnaFormattedRcoFormation.rncp_code,
      sirets: JSON.stringify({
        gestionnaire: mnaFormattedRcoFormation.etablissement_gestionnaire_siret,
        formateur: mnaFormattedRcoFormation.etablissement_formateur_siret,
        lieu_formation: mnaFormattedRcoFormation.lieu_formation_siret,
      }),
      error,
    });

    return;
  }

  rcoFormation.conversion_error = "success";
  await rcoFormation.save();

  mnaFormattedRcoFormation.to_update = true;
  // replace or insert new one

  const cF = await getOrCreateFormation(mnaFormattedRcoFormation);
  const newCf = await Formation.findOneAndUpdate({ _id: cF._id }, mnaFormattedRcoFormation, {
    upsert: true,
    new: true,
  });

  convertedRcoFormations.push({
    _id: newCf._id,
    id_rco_formation: newCf.id_rco_formation,
    cle_ministere_educatif: newCf.cle_ministere_educatif,
    cfd: newCf.cfd,
    updates: {},
    // stateEtablissements, // TODO Keep for now
  });

  return newCf;
};

const run = async (uuidReport = null) => {
  //  1 : filter rco formations which are not converted yet
  //  2 : convert them to mna format & launch updater on them
  const result = await performConversion();

  //  3 : Then create a report of conversion
  await createConversionReport(result, uuidReport);
};

const performConversion = async () => {
  const invalidRcoFormations = [];
  const convertedRcoFormations = [];

  /*************************************************************************************/
  /* FIXME: below migration code. To be removed after RCO migration without duplicates */
  /*************************************************************************************/

  // first loop only on published
  // try to find englobing actions
  // if found keep data like statut, rapprochement ...
  await paginator(
    RcoFormation,
    { filter: { published: true, converted_to_mna: { $ne: true } }, limit: 10, select: "+email" },
    async (rcoFormation) => {
      const oldFormations = await findPreviousFormations(rcoFormation);

      // if 0 do nothing : just create as below
      if (oldFormations.length === 0) {
        const mnaFormattedRcoFormation = formatToMnaFormation(rcoFormation._doc);
        await createFormation(rcoFormation, mnaFormattedRcoFormation, invalidRcoFormations, convertedRcoFormations);
        return;
      }

      if (oldFormations.length === 1) {
        const mnaFormattedRcoFormation = formatToMnaFormation(rcoFormation._doc);

        if (hasOnlyUpdatedNewFields(rcoFormation)) {
          const cF = await Formation.findOneAndUpdate(
            { _id: oldFormations[0]._id },
            {
              ...extractUsefulNewFields(mnaFormattedRcoFormation),
              to_update: false,
            },
            {
              new: true,
            }
          );

          rcoFormation.conversion_error = "success";
          await rcoFormation.save();

          convertedRcoFormations.push({
            _id: cF._id,
            id_rco_formation: cF.id_rco_formation,
            cle_ministere_educatif: cF.cle_ministere_educatif,
            cfd: cF.cfd,
            updates: {},
          });

          return;
        }

        const newFormation = await createFormation(
          rcoFormation,
          mnaFormattedRcoFormation,
          invalidRcoFormations,
          convertedRcoFormations
        );

        if (!newFormation) {
          return;
        }

        copyAffelnetFields(oldFormations[0], newFormation);
        copyParcoursupFields(oldFormations[0], newFormation);

        // TODO update rapprochement

        await newFormation.save();
        return;
      }

      if (oldFormations.length > 1) {
        const mnaFormattedRcoFormation = formatToMnaFormation(rcoFormation._doc);
        const newFormation = await createFormation(
          rcoFormation,
          mnaFormattedRcoFormation,
          invalidRcoFormations,
          convertedRcoFormations
        );

        if (!newFormation) {
          return;
        }

        const affelnet_statut = oldFormations[0].affelnet_statut;
        if (oldFormations.every((f) => f.affelnet_statut === affelnet_statut)) {
          copyAffelnetFields(oldFormations[0], newFormation);
        }

        const parcoursup_statut = oldFormations[0].parcoursup_statut;
        if (oldFormations.every((f) => f.parcoursup_statut === parcoursup_statut)) {
          copyParcoursupFields(oldFormations[0], newFormation);
        }

        // TODO if same rapprochement, keep rapprochement, else discard

        await newFormation.save();
        return;
      }
    }
  );

  // update converted_to_mna outside loop to not mess up with paginate
  await RcoFormation.updateMany(
    { conversion_error: "success" },
    { $set: { conversion_error: null, converted_to_mna: true } }
  );
  /******************************************************/
  /*  FIXME: /END RCO migration code. remove code above */
  /******************************************************/

  await paginator(
    RcoFormation,
    { filter: { converted_to_mna: { $ne: true } }, limit: 10, select: "+email" },
    async (rcoFormation) => {
      try {
        let mnaFormattedRcoFormation = formatToMnaFormation(rcoFormation._doc);

        if (!rcoFormation.published) {
          // if formation is unpublished, don't create etablissement and don't call mnaUpdater
          // since we don't care of errors we just want to hide the formation
          rcoFormation.conversion_error = "success";
          await rcoFormation.save();

          const cF = await getOrCreateFormation(mnaFormattedRcoFormation);

          await Formation.findOneAndUpdate(
            { _id: cF._id },
            {
              id_rco_formation: mnaFormattedRcoFormation.id_rco_formation,
              cle_ministere_educatif: mnaFormattedRcoFormation.cle_ministere_educatif,
              published: false,
              rco_published: false,
              update_error: null,
              to_update: false,
            },
            {
              upsert: true,
              new: true,
            }
          );

          convertedRcoFormations.push({
            _id: cF._id,
            id_rco_formation: mnaFormattedRcoFormation.id_rco_formation,
            cfd: mnaFormattedRcoFormation.cfd,
            cle_ministere_educatif: mnaFormattedRcoFormation.cle_ministere_educatif,
            updates: JSON.stringify({ published: false }),
          });
          return;
        }

        await createFormation(rcoFormation, mnaFormattedRcoFormation, invalidRcoFormations, convertedRcoFormations);
      } catch (error) {
        console.log(error);
      }
    }
  );

  // update converted_to_mna outside loop to not mess up with paginate
  await RcoFormation.updateMany(
    { conversion_error: "success" },
    { $set: { conversion_error: null, converted_to_mna: true } }
  );

  return { invalidRcoFormations, convertedRcoFormations };
};

const createConversionReport = async ({ invalidRcoFormations, convertedRcoFormations }, uuidReport) => {
  logger.info(
    "create report :",
    `${invalidRcoFormations.length} invalid formations,`,
    `${convertedRcoFormations.length} converted formations`
  );

  const summary = {
    invalidCount: invalidRcoFormations.length,
    convertedCount: convertedRcoFormations.length,
  };
  // save report in db
  const date = Date.now();
  const type = "rcoConversion";

  await storeByChunks(type, date, summary, "converted", convertedRcoFormations, uuidReport);
  await storeByChunks(`${type}.error`, date, summary, "errors", invalidRcoFormations, uuidReport);

  const link = `${config.publicUrl}/report?type=${type}&date=${date}&id=${uuidReport}`;
  console.log(link); // Useful when send in blue is down
  const data = { invalid: invalidRcoFormations, converted: convertedRcoFormations, summary, link };

  // Send mail
  const title = "[RCO Formations] Rapport de conversion";
  const to = config.rco.reportMailingList.split(",");
  await report.generate(data, title, to, "rcoConversionReport");
};

module.exports = { run, performConversion };
