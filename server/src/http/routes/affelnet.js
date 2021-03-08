const { AfFormation, AfReconciliation } = require("../../common/model");
const combinate = require("../../logic/mappers/psReconciliationMapper");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const mongoose = require("mongoose");
const express = require("express");
const { getCfdInfo } = require("../../common/services/tables_correspondance");

module.exports = ({ catalogue }) => {
  const router = express.Router();

  /**
   * Get all AfFormation
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const { type, page } = req.query;
      let data = await AfFormation.paginate(
        { matching_type: type },
        { page, sort: { etat_reconciliation: 1 }, lean: true }
      );

      if (data.docs.length > 0) {
        const result = await Promise.all(
          data.docs.map(async (formation) => {
            let { code_cfd, uai } = formation;
            if (code_cfd) {
              const infoCfd = await getCfdInfo(code_cfd);
              const infoReconciliation = await AfReconciliation.find({ code_cfd, uai });

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
   * Update AfFormation with mapped establisment
   */
  router.post(
    "/",
    tryCatch(async (req, res) => {
      const data = req.body;
      const response = await AfFormation.findByIdAndUpdate(data.id, { ...data }, { new: true });
      return res.json(response);
    })
  );

  /**
   * Update AfReconciliation with mapped establishmet
   */

  router.post(
    "/reconciliation",
    tryCatch(async (req, res) => {
      const { mapping, id_formation, ...rest } = req.body;
      const reconciliation = combinate(mapping);

      let payload = reconciliation.reduce((acc, item) => {
        acc.uai = rest.uai;
        acc.code_cfd = rest.code_cfd;
        acc.siret_formateur = item.type === "formateur" ? item.siret : acc.siret_formateur;
        acc.siret_gestionnaire = item.type === "gestionnaire" ? item.siret : acc.siret_gestionnaire;
        return acc;
      }, {});

      let { code_cfd, uai } = payload;

      const result = await AfReconciliation.findOneAndUpdate({ code_cfd, uai }, payload, { upsert: true, new: true });

      if (result) {
        await AfFormation.findByIdAndUpdate(id_formation, { etat_reconciliation: true });
      }

      return res.json(result);
    })
  );

  router.put(
    "/reconciliation",
    tryCatch(async (req, res) => {
      const { uai_formation, uai_gestionnaire, uai_formateur, cfd, email = null } = req.body;
      const uais = [uai_formation, uai_gestionnaire, uai_formateur].filter((uai) => uai);

      if (uais.length === 0 || !cfd) {
        res.status(400).json({ message: "Un uai ou le cfd est manquant" });
      }

      try {
        await AfReconciliation.findOneAndUpdate({ uai: { $in: uais }, code_cfd: cfd }, { unpublished_by_user: email });
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
      const response = await AfFormation.findByIdAndUpdate(
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
      const update = await AfFormation.updateOne(
        { _id: formation_id },
        { $set: { "matching_mna_etablissement.$[elem].type": type } },
        { arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(etablissement_id) }] }
      );
      if (update) {
        if (update.nModified === 1) {
          const response = await AfFormation.findById({ _id: formation_id });
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
