const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { PsFormation } = require("../../common/model");

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
