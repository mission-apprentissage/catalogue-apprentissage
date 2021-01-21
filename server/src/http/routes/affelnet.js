const { AfFormation, PsReconciliation } = require("../../common/model");
const combinate = require("../../logic/mappers/psReconciliationMapper");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const mongoose = require("mongoose");
const express = require("express");

module.exports = ({ catalogue, tableCorrespondance }) => {
  const router = express.Router();

  /**
   * Get Report /report GET
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const { type, page } = req.query;
      let data = await AfFormation.paginate({ matching_type: type }, { page });

      if (data.docs.length > 0) {
        const result = await Promise.all(
          data.docs.map(async (formation) => {
            let { _doc, code_cfd, uai } = formation;
            if (_doc.code_cfd) {
              const infoCfd = await tableCorrespondance.getCfdInfo(code_cfd);
              const infoReconciliation = await PsReconciliation.find({ code_cfd, uai });

              let infobcn = infoCfd.result.intitule_long;

              return {
                ...formation._doc,
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
   * Update AfFormation with mapped establisment
   */
  router.post(
    "/",
    tryCatch(async (req, res) => {
      const data = req.body;
      const response = await AfFormation.findByIdAndUpdate(data.id, { ...data }, { new: true });
      res.json(response);
    })
  );

  /**
   * Update PsReconciliation with mapped establishmet
   */

  router.post(
    "/psreconciliation",
    tryCatch(async (req, res) => {
      const { mapping, ...rest } = req.body;
      const reconciliation = combinate(mapping);

      let payload = reconciliation.reduce((acc, item) => {
        acc.uai = rest.uai;
        acc.code_cfd = rest.code_cfd;
        acc.siret_formateur = item.type === "formateur" ? item.siret : acc.siret_formateur;
        acc.siret_gestionnaire = item.type === "gestionnaire" ? item.siret : acc.siret_gestionnaire;
        return acc;
      }, {});

      let { code_cfd, uai } = payload;

      const result = await PsReconciliation.findOneAndUpdate({ code_cfd, uai }, payload, { upsert: true, new: true });

      res.json(result);
    })
  );

  /**
   * Add one establishement to a psformation
   */
  router.put(
    "/",
    tryCatch(async (req, res) => {
      const { formation_id, etablissement } = req.body;
      const response = await AfFormation.findByIdAndUpdate(
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
      const update = await AfFormation.updateOne(
        { _id: formation_id },
        { $set: { "matching_mna_etablissement.$[elem].type": type } },
        { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(etablissement_id) }] }
      );
      if (update) {
        if (update.nModified === 1) {
          const response = await AfFormation.findById({ _id: formation_id });
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
