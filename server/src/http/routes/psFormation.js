const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { PsFormation } = require("../../common/model");

module.exports = ({ catalogue, tableCorrespondance }) => {
  const router = express.Router();

  /**
   * Get Report /report GET
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const { type, page } = req.query;
      let data = await PsFormation.paginate({ matching_type: type }, { page });

      if (data.docs.length > 0) {
        const result = await Promise.all(
          data.docs.map(async (formation) => {
            if (formation._doc.code_cfd) {
              const infoCfd = await tableCorrespondance.getCfdInfo(formation.code_cfd);
              let infobcn = infoCfd.result.intitule_long;

              return {
                ...formation._doc,
                infobcn,
              };
            }
            return formation;
          })
        );

        data.docs = await result;
        res.json(data);
      } else {
        res.status(404).json({ message: `Item doesn't exist` });
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
   * Create establishment from UAI & SIRET, update its information and refetch.
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
   * Update psFormation with reconciliated data
   */

  router.put(
    "/",
    tryCatch(async (req, res) => {
      const data = req.body;
      const response = await PsFormation.findByIdAndUpdate(data._id, { ...data }, { new: true });
      res.json(response);
    })
  );

  return router;
};
