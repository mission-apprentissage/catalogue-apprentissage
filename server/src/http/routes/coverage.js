const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { PsFormation } = require("../../common/model");
const logger = require("../../common/logger");

module.exports = ({ catalogue }) => {
  const router = express.Router();

  /**
   * Get Report /report GET
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const { type } = req.query;
      const data = await PsFormation.find({ matching_type: type });

      if (data) {
        res.json(data);
      } else {
        res.json({ message: `Item doesn't exist` });
      }
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
      await PsFormation.findByIdAndUpdate(data._id, { data })
        .then(() => res.status(200))
        .catch((error) => logger.error(error));
    })
  );

  return router;
};
