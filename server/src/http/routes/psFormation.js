const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { PsFormation, PsReconciliation } = require("../../common/model");
const mongoose = require("mongoose");

module.exports = ({ catalogue, tableCorrespondance }) => {
  const router = express.Router();

  /**
   * Get all parcoursup formations
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const { type, page } = req.query;
      const data = await PsFormation.paginate({ matching_type: type }, { page });

      if (data.docs.length > 0) {
        const mapping = await Promise.all(
          data.docs.map(async (formation) => {
            const matchedEtablissement = await PsReconciliation.find({ if_formation_psup: formation._id }).lean();
            console.log("matchedEtablissement.length", matchedEtablissement.length);

            if (formation._doc.code_cfd) {
              const infoCfd = await tableCorrespondance.getCfdInfo(formation.code_cfd);
              let infobcn = infoCfd.result.intitule_long;

              return {
                infobcn,
                ...formation._doc,
                ...matchedEtablissement,
              };
            }
            return { formation, ...matchedEtablissement };
          })
        );

        data.docs = await mapping;
        res.json(data);
      } else {
        res.status(404).json([]);
      }
    })
  );

  router.post(
    "/",
    tryCatch(async (req, res) => {
      const data = req.body;
      const response = await PsFormation.findByIdAndUpdate(data.id, { ...data }, { new: true });
      res.json(response);
    })
  );

  /**
   * Add created establishment to the matched list of establishments
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
      const newEtablissement = await catalogue.createEtablissement({ uai, siret });
      res.json(newEtablissement);
    })
  );

  /**
   * Create new line in PsReconciliation collection
   */
  router.post(
    "/nouveau-lien",
    tryCatch(async (req, res) => {
      const payload = req.body;
      const result = await PsReconciliation.create(payload);
      res.json(result);
    })
  );

  /**
   * Update line in PsReconciliation collection
   */
  router.put(
    "update-lien",
    tryCatch(async (req, res) => {
      const { id, ...rest } = req.body;
      const result = await PsReconciliation.findByIdAndUpdate(id, { ...rest });
      res.json(result);
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
