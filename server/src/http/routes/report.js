const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Report } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  /**
   * Get Report /report GET
   */
  router.get(
    "/report",
    tryCatch(async (req, res) => {
      const qs = req.query;
      let query;
      try {
        query = qs && qs.query ? JSON.parse(qs.query) : {};
      } catch (e) {
        return res.status(400).send({ error: "invalid query params" });
      }

      const retrievedData = await Report.findOne(query);
      if (retrievedData) {
        res.json(retrievedData);
      } else {
        res.json({ message: `Item doesn't exist` });
      }
    })
  );

  return router;
};
