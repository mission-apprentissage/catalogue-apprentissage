const { PsFormation, PsReconciliation } = require("../../common/model");
const combinate = require("../../logic/mappers/psReconciliationMapper");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const mongoose = require("mongoose");
const express = require("express");
const { getCfdInfo } = require("../../common/services/tables_correspondance");

module.exports = ({ catalogue }) => {
  const router = express.Router();

  /**
   * Get all PsFormation
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const { type, page } = req.query;
      let data = await PsFormation.paginate(
        { matching_type: type },
        { page, sort: { etat_reconciliation: 1 }, lean: true }
      );

      if (data.docs.length > 0) {
        const result = await Promise.all(
          data.docs.map(async (formation) => {
            let { code_cfd, uai_affilie, uai_composante, uai_gestionnaire } = formation;
            if (code_cfd) {
              const infoCfd = await getCfdInfo(code_cfd);
              const infoReconciliation = await PsReconciliation.find({
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
        res.json(data);
      } else {
        res.status(404).json([]);
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
      const response = await PsFormation.findByIdAndUpdate(id, { ...rest }, { new: true });
      res.json(response);
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
        payload,
        { upsert: true, new: true }
      );

      if (result) {
        await PsFormation.findByIdAndUpdate(id_formation, { etat_reconciliation: true });
      }

      res.json(result);
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
      const response = await PsFormation.findByIdAndUpdate(
        formation_id,
        { $push: { matching_mna_etablissement: { ...etablissement, _id: new mongoose.Types.ObjectId() } } },
        { new: true }
      );
      res.json(response);
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
      res.json(newEtablissement);
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
          res.json(response);
        } else {
          res.json(update);
        }
      } else {
        res.status(400).json([]);
      }
    })
  );

  return router;
};
