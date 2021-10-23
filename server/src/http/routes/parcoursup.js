const { PsFormation, Formation } = require("../../common/model");
// const combinate = require("../../logic/mappers/reconciliationMapper");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const mongoose = require("mongoose");
const express = require("express");
const { getEtablissementCoverage } = require("../../logic/controller/coverage");
const reportRejected = require("../../jobs/parcoursup/reportRejected");

const { diffFormation, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");

module.exports = ({ catalogue }) => {
  const router = express.Router();

  /**
   * Get statistique
   */

  router.get(
    "/statistique",
    tryCatch(async (req, res) => {
      let [w, x, y, z] = await Promise.all([
        PsFormation.estimatedDocumentCount(),
        PsFormation.countDocuments({ etat_reconciliation: true }),
        PsFormation.countDocuments({ matching_type: { $ne: null }, etat_reconciliation: false }),
        PsFormation.countDocuments({ matching_type: { $eq: null } }),
      ]);

      let percentageOnTotal = (value, total) => ((value / total) * 100).toFixed(2);

      res.json({
        total: w,
        reconciled: [x, percentageOnTotal(x, w)],
        covered: [y, percentageOnTotal(y, w)],
        notFound: [z, percentageOnTotal(z, w)],
      });
    })
  );

  router.get(
    "/:id",
    tryCatch(async (req, res) => {
      const itemId = req.params.id;
      const qs = req.query;
      const select = qs && qs.select ? JSON.parse(qs.select) : { __v: 0 };
      const retrievedData = await PsFormation.findById(itemId, select).lean();
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
      const select =
        qs && qs.select
          ? JSON.parse(qs.select)
          : { __v: 0, rncp_details: 0, updates_history: 0, affelnet_statut_history: 0 };
      const retrievedData = await PsFormation.findById(psId, select).lean();
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
      const response = await PsFormation.findByIdAndUpdate(id, { ...rest }, { new: true });
      return res.json(response);
    })
  );

  /**
   * Update
   */

  router.post(
    "/reconciliation",
    tryCatch(async (req, res) => {
      const {
        id_formation,
        reject,
        matching_rejete_raison,
        rapprochement_rejete_raisons,
        rapprochement_rejete_raison_autre,
        ...rest
      } = req.body; // mapping ---------
      if (reject) {
        const previousFormation = await PsFormation.findById(id_formation).lean();

        let updatedFormation = {
          ...previousFormation,
          statut_reconciliation: "REJETE",
          matching_rejete_raison,
          etat_reconciliation: false,
          matching_rejete_updated: false,
          rapprochement_rejete_raisons,
          rapprochement_rejete_raison_autre,
        };

        if (matching_rejete_raison === "##USER_CANCEL##") {
          updatedFormation = {
            ...previousFormation,
            statut_reconciliation: "A_VERIFIER", // ERROR TODO Take the previous one instead
            matching_rejete_raison: null,
            etat_reconciliation: false,
            matching_rejete_updated: true,
            rapprochement_rejete_raisons: [],
            rapprochement_rejete_raison_autre: null,
          };
        }

        // History
        const { updates, keys } = diffFormation(previousFormation, updatedFormation);
        if (updates) {
          delete updates.matching_mna_formation;
          const statuts_history = buildUpdatesHistory(previousFormation, updates, keys, null, true);

          updatedFormation.statuts_history = statuts_history;
        }

        await PsFormation.findOneAndUpdate({ _id: id_formation }, updatedFormation, { new: true });

        return res.json({});
      }

      // const reconciliation = combinate(mapping);

      // let payload = reconciliation.reduce((acc, item) => {
      //   acc.uai_gestionnaire = rest.uai_gestionnaire;
      //   acc.uai_affilie = rest.uai_affilie;
      //   acc.uai_composante = rest.uai_composante;
      //   acc.code_cfd = rest.code_cfd;
      //   acc.siret_formateur = item.type === "formateur" ? item.siret : acc.siret_formateur;
      //   acc.siret_gestionnaire = item.type === "gestionnaire" ? item.siret : acc.siret_gestionnaire;
      //   return acc;
      // }, {});

      // let { code_cfd: code_cfd, uai_affilie, uai_composante, uai_gestionnaire } = payload; ------------

      // const result = await PsReconciliation.findOneAndUpdate(
      //   { code_cfd: code_cfd, uai_affilie, uai_composante, uai_gestionnaire },
      //   {
      //     ...payload,
      //     source: "MANUEL",
      //     unpublished_by_user: null,
      //     $push: { ids_parcoursup: rest.id_parcoursup },
      //   },
      //   { upsert: true, new: true }
      // );

      // if (result) {
      const previousFormation = await PsFormation.findById(id_formation).lean();

      const mnaFormation = await Formation.findById(rest.mnaFormationId).lean();
      let matching_mna_formation = [];
      let matching_mna_parcoursup_statuts = [];
      if (previousFormation.statut_reconciliation === "VALIDE" && previousFormation.matching_mna_formation.length > 0) {
        if (!previousFormation.matching_mna_formation.map(({ _id }) => `${_id}`).includes(rest.mnaFormationId)) {
          matching_mna_formation = [
            ...previousFormation.matching_mna_formation,
            {
              _id: mnaFormation._id,
              intitule_court: mnaFormation.intitule_court,
              parcoursup_statut: mnaFormation.parcoursup_statut,
            },
          ];

          matching_mna_parcoursup_statuts = [
            ...previousFormation.matching_mna_parcoursup_statuts,
            mnaFormation.parcoursup_statut,
          ];
        } else {
          matching_mna_formation = previousFormation.matching_mna_formation;
          matching_mna_parcoursup_statuts = previousFormation.matching_mna_parcoursup_statuts;
        }
      } else {
        matching_mna_formation = [
          {
            _id: mnaFormation._id,
            intitule_court: mnaFormation.intitule_court,
            parcoursup_statut: mnaFormation.parcoursup_statut,
          },
        ];
        matching_mna_parcoursup_statuts = [mnaFormation.parcoursup_statut];
      }

      let updatedFormation = {
        ...previousFormation,
        // id_reconciliation: result._id.toString(), -----------------------
        statut_reconciliation: "VALIDE",
        etat_reconciliation: true,
        matching_rejete_updated: false,
        matching_mna_formation,
        matching_mna_parcoursup_statuts,
      };

      // History
      const { updates, keys } = diffFormation(previousFormation, updatedFormation);
      if (updates) {
        delete updates.matching_mna_formation;
        const statuts_history = buildUpdatesHistory(previousFormation, updates, keys, null, true);

        updatedFormation.statuts_history = statuts_history;
      }

      await PsFormation.findOneAndUpdate({ _id: id_formation }, updatedFormation, { new: true });
      // }

      return res.json(); /// result -------------------
    })
  );

  router.get(
    "/reconciliation/count",
    tryCatch(async (req, res) => {
      const countTotal = await PsFormation.countDocuments({});
      const countAutomatique = await PsFormation.countDocuments({ statut_reconciliation: "AUTOMATIQUE" });
      const countAVerifier = await PsFormation.countDocuments({ statut_reconciliation: "A_VERIFIER" });
      const countRejete = await PsFormation.countDocuments({ statut_reconciliation: "REJETE" });
      const countInconnu = await PsFormation.countDocuments({ statut_reconciliation: "INCONNU" });
      const countValide = await PsFormation.countDocuments({ statut_reconciliation: "VALIDE" });
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

  // router.put(   ---------------
  //   "/reconciliation",
  //   tryCatch(async (req, res) => {
  //     const { uai_gestionnaire, cfd, uai_affilie = null, email = null } = req.body;

  //     if (!uai_gestionnaire || !cfd) {
  //       res.status(400).json({ message: "Un uai ou le cfd est manquant" });
  //     }

  //     try {
  //       const filter = { uai_gestionnaire, code_cfd: cfd };
  //       if (uai_affilie) {
  //         // optional filter
  //         filter.uai_affilie = uai_affilie;
  //       }

  //       await PsReconciliation.findOneAndUpdate(filter, { unpublished_by_user: email });
  //       return res.sendStatus(200);
  //     } catch (error) {
  //       return res.status(400).json(error);
  //     }
  //   })
  // );

  /**
   * Add one establishement to a psformation
   */
  router.put(
    "/",
    tryCatch(async (req, res) => {
      const { formation_id, etablissement } = req.body;
      const response = await PsFormation.findByIdAndUpdate(
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

      let etablissement = await catalogue.getEtablissement({ uai, siret });
      let newEtablissement = false;
      if (etablissement.message === "Etablissement doesn't exist") {
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
      const update = await PsFormation.updateOne(
        { _id: formation_id },
        { $set: { "matching_mna_etablissement.$[elem].type": type } },
        { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(etablissement_id) }] }
      );
      if (update) {
        if (update.nModified === 1) {
          const response = await PsFormation.findById({ _id: formation_id });
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

  return router;
};
