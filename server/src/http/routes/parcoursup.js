const { ParcoursupFormation, Formation, Etablissement } = require("../../common/model");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const mongoose = require("mongoose");
const express = require("express");
const { getEtablissementCoverage } = require("../../logic/controller/coverage");
const reportRejected = require("../../jobs/parcoursup/reportRejected");
const { buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");
const { updateParcoursupCoverage } = require("../../logic/updaters/coverageUpdater");
const Boom = require("boom");
const { createFormation } = require("../../jobs/parcoursup/export");
const { PARCOURSUP_STATUS } = require("../../constants/status");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/:id",
    tryCatch(async (req, res) => {
      const itemId = req.params.id;
      const qs = req.query;
      const select = qs && qs.select ? JSON.parse(qs.select) : { __v: 0 };
      const retrievedData = await ParcoursupFormation.findById(itemId, select).lean();
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Item ${itemId} doesn't exist` });
    })
  );

  const buildDiff = async (psFormation, _id, select) => {
    const mnaFormation = await Formation.findById(_id, select).lean();
    const {
      uai_formation,
      etablissement_formateur_uai,
      etablissement_gestionnaire_uai,
      cfd_entree,
      lieu_formation_siret,
      etablissement_formateur_siret,
      etablissement_gestionnaire_siret,
      code_commune_insee,
      nom_academie,
      rncp_code,
      lieu_formation_adresse,
    } = mnaFormation;

    const compareUais = (psFormation, uai) => {
      const r = {
        uai_affilie: psFormation.uai_affilie === uai,
        uai_gestionnaire: psFormation.uai_gestionnaire === uai,
        uai_composante: psFormation.uai_composante === uai,
        uai_insert_jeune: psFormation.uai_insert_jeune === uai,
        uai_cerfa: psFormation.uai_cerfa === uai,
      };
      return {
        ...r,
        match: r.uai_affilie || r.uai_gestionnaire || r.uai_composante || r.uai_insert_jeune || r.uai_cerfa,
      };
    };

    const compareSiret = (psFormation, siret) => {
      const r = {
        siret_cerfa: psFormation.siret_cerfa === siret,
        siret_map: psFormation.siret_map === siret,
      };
      return {
        ...r,
        match: r.siret_cerfa || r.siret_map,
      };
    };
    const uai = {
      uai_formation: compareUais(psFormation, uai_formation),
      etablissement_formateur_uai: compareUais(psFormation, etablissement_formateur_uai),
      etablissement_gestionnaire_uai: compareUais(psFormation, etablissement_gestionnaire_uai),
    };
    const siret = {
      lieu_formation_siret: compareSiret(psFormation, lieu_formation_siret),
      etablissement_formateur_siret: compareSiret(psFormation, etablissement_formateur_siret),
      etablissement_gestionnaire_siret: compareSiret(psFormation, etablissement_gestionnaire_siret),
    };
    const diffFields = {
      uai: {
        ...uai,
        uai_affilie: uai.uai_formation.uai_affilie,
        uai_composante: uai.etablissement_formateur_uai.uai_composante,
        uai_gestionnaire: uai.etablissement_gestionnaire_uai.uai_gestionnaire,
        uai_insert_jeune:
          uai.uai_formation.uai_insert_jeune ||
          uai.etablissement_formateur_uai.uai_insert_jeune ||
          uai.etablissement_gestionnaire_uai.uai_insert_jeune,
        uai_cerfa:
          uai.uai_formation.uai_cerfa ||
          uai.etablissement_formateur_uai.uai_cerfa ||
          uai.etablissement_gestionnaire_uai.uai_cerfa,
      },
      siret: {
        ...siret,
        siret_cerfa:
          siret.lieu_formation_siret.siret_cerfa ||
          siret.etablissement_formateur_siret.siret_cerfa ||
          siret.etablissement_gestionnaire_siret.siret_cerfa,
        siret_map:
          siret.lieu_formation_siret.siret_map ||
          siret.etablissement_formateur_siret.siret_map ||
          siret.etablissement_gestionnaire_siret.siret_map,
      },
      cfd_entree: psFormation.codes_cfd_mna.includes(cfd_entree),
      rncp_code: psFormation.codes_rncp_mna.includes(rncp_code),
      code_commune_insee: psFormation.code_commune_insee === code_commune_insee,
      nom_academie: psFormation.nom_academie === nom_academie,
      lieu_formation_adresse: psFormation.adresse_etablissement_l1 === lieu_formation_adresse,
    };

    return {
      mnaFormation,
      diffFields,
    };
  };

  router.get(
    "/reconciliation/result/:id",
    tryCatch(async (req, res) => {
      const psId = req.params.id;
      const qs = req.query;
      const select = qs && qs.select ? JSON.parse(qs.select) : { __v: 0, rncp_details: 0, affelnet_statut_history: 0 };
      const retrievedData = await ParcoursupFormation.findById(psId, select).lean();
      if (retrievedData) {
        const diffFields = [];
        let matching_mna_formation = retrievedData.matching_mna_formation;
        let matching_mna_etablissement = [];
        if (
          retrievedData.statut_reconciliation === "AUTOMATIQUE" ||
          retrievedData.statut_reconciliation === "A_VERIFIER" ||
          retrievedData.statut_reconciliation === "REJETE" ||
          retrievedData.statut_reconciliation === "VALIDE"
        ) {
          const updated_matching_mna_formation = [];

          await asyncForEach(retrievedData.matching_mna_formation, async ({ _id }) => {
            const diffResult = await buildDiff(retrievedData, _id, select);
            updated_matching_mna_formation.push(diffResult.mnaFormation);
            diffFields.push(diffResult.diffFields);
          });
          matching_mna_formation = updated_matching_mna_formation;
          matching_mna_etablissement = await getEtablissementCoverage(matching_mna_formation);
        }
        return res.json({ ...retrievedData, diff: diffFields, matching_mna_formation, matching_mna_etablissement });
      }
      return res.status(404).send({ message: `Item ${psId} doesn't exist` });
    })
  );

  /**
   * Update PsFormation with mapped establisment
   */
  router.post(
    "/",
    tryCatch(async (req, res) => {
      const { id, ...rest } = req.body;
      const response = await ParcoursupFormation.findByIdAndUpdate(id, { ...rest }, { new: true });
      return res.json(response);
    })
  );

  /**
   * Update
   */

  router.post(
    "/reconciliation",
    tryCatch(async (req, res) => {
      let user = {};
      if (req.user) {
        user = req.session?.passport?.user;
      }

      const {
        id_formation,
        reject,
        matching_rejete_raison,
        rapprochement_rejete_raisons,
        rapprochement_rejete_raison_autre,
        mnaFormationId,
      } = req.body;
      if (reject) {
        const previousFormation = await ParcoursupFormation.findById(id_formation).lean();
        let updatedFormation = {
          ...previousFormation,
          statut_reconciliation: "REJETE",
          matching_rejete_raison,
          etat_reconciliation: false,
          matching_rejete_updated: false,
          rapprochement_rejete_raisons,
          rapprochement_rejete_raison_autre,
          validated_formation_ids: [],
        };

        if (matching_rejete_raison === "##USER_CANCEL##") {
          updatedFormation = {
            ...previousFormation,
            statut_reconciliation: "A_VERIFIER",
            matching_rejete_raison: null,
            etat_reconciliation: false,
            matching_rejete_updated: true,
            rapprochement_rejete_raisons: [],
            rapprochement_rejete_raison_autre: null,
            validated_formation_ids: [],
          };
        }

        const formation = await ParcoursupFormation.findOneAndUpdate({ _id: id_formation }, updatedFormation, {
          new: true,
        });

        if (["A_VERIFIER", "AUTOMATIQUE"].includes(formation.statut_reconciliation)) {
          // re-run coverage to prevent match with unpublished formations
          await updateParcoursupCoverage(formation._doc);
        }

        return res.json({});
      }

      const psFormation = await ParcoursupFormation.findById(id_formation).lean();

      let statut_reconciliation = "VALIDE";
      let etat_reconciliation = true;
      let matching_rejete_updated = false;

      // Cancel a validated rapprochement
      if (matching_rejete_raison === "##USER_CANCEL##") {
        statut_reconciliation = "A_VERIFIER";

        etat_reconciliation = false;

        if (psFormation.validated_formation_ids) {
          for (let index = 0; index < psFormation.validated_formation_ids.length; index++) {
            const mnaId = psFormation.validated_formation_ids[index];
            const mnaFormationU = await Formation.findById(mnaId);
            if (mnaFormationU) {
              mnaFormationU.parcoursup_id = null;
              for (let jndex = mnaFormationU.updates_history.length - 1; jndex >= 0; jndex--) {
                const { from, to } = mnaFormationU.updates_history[jndex];
                if (
                  to.parcoursup_statut === PARCOURSUP_STATUS.PUBLIE &&
                  from.parcoursup_statut !== PARCOURSUP_STATUS.PUBLIE
                ) {
                  // push this new state in history
                  mnaFormationU.updates_history = buildUpdatesHistory(
                    mnaFormationU,
                    {
                      parcoursup_statut: from.parcoursup_statut,
                      parcoursup_raison_depublication: from.parcoursup_raison_depublication,
                      last_update_who: user.email,
                    },
                    ["parcoursup_statut", "parcoursup_raison_depublication", "last_update_who"]
                  );

                  mnaFormationU.parcoursup_statut = from.parcoursup_statut;
                  mnaFormationU.parcoursup_raison_depublication = from.parcoursup_raison_depublication;
                  mnaFormationU.last_update_who = user.email;
                  mnaFormationU.parcoursup_published_date = null;
                  break;
                }
              }
              await mnaFormationU.save();
            }
          }
        }

        let updatedFormation = {
          ...psFormation,
          statut_reconciliation,
          etat_reconciliation,
          matching_rejete_updated,
          validated_formation_ids: [],
        };

        const formation = await ParcoursupFormation.findOneAndUpdate({ _id: id_formation }, updatedFormation, {
          new: true,
        });

        if (["A_VERIFIER", "AUTOMATIQUE"].includes(formation.statut_reconciliation)) {
          // re-run coverage to prevent match with unpublished formations
          await updateParcoursupCoverage(formation._doc);
        }

        return res.json({});
      }

      let updatedFormation = {
        ...psFormation,
        statut_reconciliation,
        etat_reconciliation,
        matching_rejete_updated,
        validated_formation_ids: psFormation.validated_formation_ids
          ? [...psFormation.validated_formation_ids, mnaFormationId]
          : [mnaFormationId],
      };

      const formation = await ParcoursupFormation.findOneAndUpdate({ _id: id_formation }, updatedFormation, {
        new: true,
      });

      if (["A_VERIFIER", "AUTOMATIQUE"].includes(formation.statut_reconciliation)) {
        // re-run coverage to prevent match with unpublished formations
        await updateParcoursupCoverage(formation._doc);
      }

      return res.json({});
    })
  );

  router.get(
    "/reconciliation/count",
    tryCatch(async (req, res) => {
      const countTotal = await ParcoursupFormation.countDocuments({});
      const countAutomatique = await ParcoursupFormation.countDocuments({ statut_reconciliation: "AUTOMATIQUE" });
      const countAVerifier = await ParcoursupFormation.countDocuments({ statut_reconciliation: "A_VERIFIER" });
      const countRejete = await ParcoursupFormation.countDocuments({ statut_reconciliation: "REJETE" });
      const countInconnu = await ParcoursupFormation.countDocuments({ statut_reconciliation: "INCONNU" });
      const countValide = await ParcoursupFormation.countDocuments({ statut_reconciliation: "VALIDE" });
      return res.json({
        countTotal,
        countAutomatique,
        countAVerifier,
        countInconnu,
        countRejete,
        countValide,
      });
    })
  );

  /**
   * Add one establishement to a psformation
   */
  router.put(
    "/",
    tryCatch(async (req, res) => {
      const { formation_id, etablissement } = req.body;
      const response = await ParcoursupFormation.findByIdAndUpdate(
        formation_id,
        { $push: { matching_mna_etablissement: { ...etablissement, _id: new mongoose.Types.ObjectId() } } },
        { new: true }
      );
      return res.json(response);
    })
  );

  /**
   * Get establishment
   */
  router.post(
    "/etablissement",
    tryCatch(async (req, res) => {
      const { uai, siret } = req.body;
      if (!siret || !uai) {
        return res.status(400).send({ error: "Missing siret or uai in request body" });
      }

      let etablissement = await Etablissement.findOne({ uai, siret });
      let newEtablissement = false;
      if (!etablissement) {
        //TODO once we create etablissement = await catalogue.createEtablissement({ uai, siret });
        newEtablissement = true;
      }
      return res.json({ ...etablissement, new: newEtablissement });
    })
  );

  /**
   * Update one establishment type in matching_mna_etablissement array
   */
  router.put(
    "/etablissement",
    tryCatch(async (req, res) => {
      const { formation_id, etablissement_id, type } = req.body;
      const update = await ParcoursupFormation.updateOne(
        { _id: formation_id },
        { $set: { "matching_mna_etablissement.$[elem].type": type } },
        { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(etablissement_id) }] }
      );
      if (update) {
        if (update.nModified === 1) {
          const response = await ParcoursupFormation.findById({ _id: formation_id });
          return res.json(response);
        } else {
          return res.json(update);
        }
      } else {
        return res.status(400).json([]);
      }
    })
  );

  /**
   * Send Reject report
   */
  router.post(
    "/reconciliation/sendreport",
    tryCatch(async (req, res) => {
      // const formation = req.body;
      await reportRejected();

      return res.json();
    })
  );

  /**
   * Send formation to the Parcoursup web service
   */
  router.post(
    "/send-ws",
    tryCatch(async (req, res) => {
      let user = {};
      if (req.user) {
        user = req.session?.passport?.user;
      }

      const { id } = req.body;
      const formation = await Formation.findById(id);

      if (!formation) {
        throw Boom.notFound();
      }

      if (!formation.parcoursup_statut === PARCOURSUP_STATUS.EN_ATTENTE) {
        throw Boom.forbidden('La formation n\'est pas "en attente de publication"');
      }

      const formationUpdated = await createFormation(formation, user.email);
      if (formationUpdated.parcoursup_error) {
        return res.status(500).json({ message: formationUpdated.parcoursup_error });
      }
      return res.json(formationUpdated);
    })
  );

  return router;
};
