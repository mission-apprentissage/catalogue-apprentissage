const { PsReconciliation, PsFormation2021, ConvertedFormation } = require("../../common/model");
const combinate = require("../../logic/mappers/psReconciliationMapper");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const mongoose = require("mongoose");
const express = require("express");
const { getCfdInfo } = require("@mission-apprentissage/tco-service-node");
const { getEtablissementCoverage } = require("../../logic/controller/coverage");

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
        PsFormation2021.estimatedDocumentCount(),
        PsFormation2021.countDocuments({ etat_reconciliation: true }),
        PsFormation2021.countDocuments({ matching_type: { $ne: null }, etat_reconciliation: false }),
        PsFormation2021.countDocuments({ matching_type: { $eq: null } }),
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
      const retrievedData = await PsFormation2021.findById(itemId, select).lean();
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Item ${itemId} doesn't exist` });
    })
  );

  const buildDiff = async (psFormation, matchedMnaFormation, select) => {
    const mnaFormation = await ConvertedFormation.findById(matchedMnaFormation._id, select).lean();
    const {
      uai_formation,
      etablissement_formateur_uai,
      etablissement_gestionnaire_uai,
      cfd,
      lieu_formation_siret,
      etablissement_formateur_siret,
      etablissement_gestionnaire_siret,
      code_commune_insee,
      nom_academie,
      rncp_code,
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
      cfd: psFormation.codes_cfd_mna.includes(cfd),
      rncp_code: psFormation.codes_rncp_mna.includes(rncp_code),
      code_commune_insee: psFormation.code_commune_insee === code_commune_insee,
      nom_academie: psFormation.nom_academie === nom_academie,
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
      const select = qs && qs.select ? JSON.parse(qs.select) : { __v: 0 };
      const retrievedData = await PsFormation2021.findById(psId, select).lean();
      if (retrievedData) {
        const diffFields = [];
        let matching_mna_formation = retrievedData.matching_mna_formation;
        let matching_mna_etablissement = [];
        if (
          retrievedData.statut_reconciliation === "AUTOMATIQUE" ||
          retrievedData.statut_reconciliation === "A_VERIFIER" ||
          retrievedData.statut_reconciliation === "VALIDE"
        ) {
          const updated_matching_mna_formation = [];

          await asyncForEach(retrievedData.matching_mna_formation, async (mnaF) => {
            const diffResult = await buildDiff(retrievedData, mnaF, select);
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
   * Get all PsFormation
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const { type, page } = req.query;
      let data = await PsFormation2021.paginate(
        { matching_type: type },
        { page, sort: { etat_reconciliation: 1 }, lean: true }
      );

      if (data.docs.length > 0) {
        const result = await Promise.all(
          data.docs.map(async (formation) => {
            let { code_cfd, uai_affilie, uai_composante, uai_gestionnaire } = formation;
            if (code_cfd) {
              const infoCfd = await getCfdInfo(code_cfd);

              const infoReconciliation = await PsReconciliation.findOne({
                code_cfd: code_cfd,
                uai_affilie,
                uai_composante,
                uai_gestionnaire,
              });

              let infobcn = infoCfd.result.intitule_long;

              return {
                ...formation,
                reconciliation: infoReconciliation,
                infobcn,
              };
            }
            return formation;
          })
        );

        data.docs = await result;
        return res.json(data);
      } else {
        return res.status(404).json([]);
      }
    })
  );

  /**
   * Update PsFormation with mapped establisment
   */
  router.post(
    "/",
    tryCatch(async (req, res) => {
      const { id, ...rest } = req.body;
      const response = await PsFormation2021.findByIdAndUpdate(id, { ...rest }, { new: true });
      return res.json(response);
    })
  );

  /**
   * Update PsReconciliation with mapped establishmet
   */

  router.post(
    "/reconciliation",
    tryCatch(async (req, res) => {
      const { mapping, id_formation, reject, matching_rejete_raison, ...rest } = req.body;

      if (reject) {
        const previousFormation = await PsFormation2021.findById(id_formation).lean();

        let updatedFormation = {
          ...previousFormation,
          statut_reconciliation: "REJETE",
          matching_rejete_raison,
          etat_reconciliation: false,
          matching_rejete_updated: false,
        };

        // History
        const { updates, keys } = diffFormation(previousFormation, updatedFormation);
        if (updates) {
          delete updates.matching_mna_formation;
          const statuts_history = buildUpdatesHistory(previousFormation, updates, keys, null, true);

          updatedFormation.statuts_history = statuts_history;
        }

        await PsFormation2021.findOneAndUpdate({ _id: id_formation }, updatedFormation, { new: true });

        return res.json({});
      }

      const reconciliation = combinate(mapping);

      let payload = reconciliation.reduce((acc, item) => {
        acc.uai_gestionnaire = rest.uai_gestionnaire;
        acc.uai_affilie = rest.uai_affilie;
        acc.uai_composante = rest.uai_composante;
        acc.code_cfd = rest.code_cfd;
        acc.siret_formateur = item.type === "formateur" ? item.siret : acc.siret_formateur;
        acc.siret_gestionnaire = item.type === "gestionnaire" ? item.siret : acc.siret_gestionnaire;
        return acc;
      }, {});

      let { code_cfd: code_cfd, uai_affilie, uai_composante, uai_gestionnaire } = payload;

      const result = await PsReconciliation.findOneAndUpdate(
        { code_cfd: code_cfd, uai_affilie, uai_composante, uai_gestionnaire },
        {
          ...payload,
          source: "MANUEL",
          unpublished_by_user: null,
          $push: { ids_parcoursup: rest.id_parcoursup },
        },
        { upsert: true, new: true }
      );

      if (result) {
        const previousFormation = await PsFormation2021.findById(id_formation).lean();

        const mnaFormation = await ConvertedFormation.findById(rest.mnaFormationId).lean();

        let updatedFormation = {
          ...previousFormation,
          id_reconciliation: result._id.toString(),
          statut_reconciliation: "VALIDE",
          etat_reconciliation: true,
          matching_rejete_updated: false,
          matching_mna_formation: [
            {
              _id: mnaFormation._id,
              intitule_court: mnaFormation.intitule_court,
              parcoursup_statut: mnaFormation.parcoursup_statut,
            },
          ],
          matching_mna_parcoursup_statuts: [mnaFormation.parcoursup_statut],
        };

        // History
        const { updates, keys } = diffFormation(previousFormation, updatedFormation);
        if (updates) {
          delete updates.matching_mna_formation;
          const statuts_history = buildUpdatesHistory(previousFormation, updates, keys, null, true);

          updatedFormation.statuts_history = statuts_history;
        }

        await PsFormation2021.findOneAndUpdate({ _id: id_formation }, updatedFormation, { new: true });
      }

      return res.json(result);
    })
  );

  router.get(
    "/reconciliation/count",
    tryCatch(async (req, res) => {
      const countTotal = await PsFormation2021.countDocuments({});
      const countAutomatique = await PsFormation2021.countDocuments({ statut_reconciliation: "AUTOMATIQUE" });
      const countAVerifier = await PsFormation2021.countDocuments({ statut_reconciliation: "A_VERIFIER" });
      const countInconnu = await PsFormation2021.countDocuments({
        $or: [{ statut_reconciliation: "INCONNU" }, { statut_reconciliation: "REJETE" }],
      });
      const countValide = await PsFormation2021.countDocuments({ statut_reconciliation: "VALIDE" });
      return res.json({
        countTotal,
        countAutomatique,
        countAVerifier,
        countInconnu,
        countValide,
      });
    })
  );

  router.put(
    "/reconciliation",
    tryCatch(async (req, res) => {
      const { uai_gestionnaire, cfd, uai_affilie = null, email = null } = req.body;

      if (!uai_gestionnaire || !cfd) {
        res.status(400).json({ message: "Un uai ou le cfd est manquant" });
      }

      try {
        const filter = { uai_gestionnaire, code_cfd: cfd };
        if (uai_affilie) {
          // optional filter
          filter.uai_affilie = uai_affilie;
        }

        await PsReconciliation.findOneAndUpdate(filter, { unpublished_by_user: email });
        return res.sendStatus(200);
      } catch (error) {
        return res.status(400).json(error);
      }
    })
  );

  /**
   * Add one establishement to a psformation
   */
  router.put(
    "/",
    tryCatch(async (req, res) => {
      const { formation_id, etablissement } = req.body;
      const response = await PsFormation2021.findByIdAndUpdate(
        formation_id,
        { $push: { matching_mna_etablissement: { ...etablissement, _id: new mongoose.Types.ObjectId() } } },
        { new: true }
      );
      return res.json(response);
    })
  );

  /**
   * Create establishment
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
      const update = await PsFormation2021.updateOne(
        { _id: formation_id },
        { $set: { "matching_mna_etablissement.$[elem].type": type } },
        { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(etablissement_id) }] }
      );
      if (update) {
        if (update.nModified === 1) {
          const response = await PsFormation2021.findById({ _id: formation_id });
          return res.json(response);
        } else {
          return res.json(update);
        }
      } else {
        return res.status(400).json([]);
      }
    })
  );

  return router;
};
