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
      const { type, date } = req.query;
      const report = await Report.findOne({ type, date });
      if (report) {
        res.json(report);
      } else {
        res.json({ message: `Item doesn't exist` });
      }
    })
  );

  return router;
};
