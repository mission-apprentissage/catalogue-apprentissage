const { PsReconciliation, PsFormation2021 } = require("../../common/model");
const combinate = require("../../logic/mappers/psReconciliationMapper");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const mongoose = require("mongoose");
const express = require("express");
const { getCfdInfo } = require("@mission-apprentissage/tco-service-node");

const { diffFormation } = require("../../logic/common/utils/diffUtils");

const buildUpdatesHistory = (psformation, updates, keys, source) => {
  const from = keys.reduce((acc, key) => {
    acc[key] = psformation[key];
    return acc;
  }, {});

  return [
    ...(psformation.statuts_history || []),
    { from, to: { ...updates }, updated_at: Date.now(), ...(source ? { source } : {}) },
  ];
};

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
      const { mapping, id_formation, ...rest } = req.body;
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

      console.log(result._id, rest.id_parcoursup, id_formation);

      if (result) {
        const previousFormation = await PsFormation2021.findById(id_formation).lean();

        let updatedFormation = {
          ...previousFormation,
          id_reconciliation: result._id,
          statut_reconciliation: "VALIDE",
          etat_reconciliation: true,
          matching_rejete_updated: false,
        };

        // History
        const { updates, keys } = diffFormation(previousFormation, updatedFormation);
        if (updates) {
          delete updates.matching_mna_formation;
          const statuts_history = buildUpdatesHistory(previousFormation, updates, keys);

          updatedFormation.statuts_history = statuts_history;
        }

        await PsFormation2021.findByIdAndUpdate(id_formation, updatedFormation);
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

      const newEtablissement = await catalogue.createEtablissement({ uai, siret });
      return res.json(newEtablissement);
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
