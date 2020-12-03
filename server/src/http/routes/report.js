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

      let report;
      if (type === "rcoConversion") {
        const reports = await Report.find({ type, date });
        if (reports.length > 0) {
          const initialValue = { ...reports[0], data: { ...reports[0].data, converted: [] } };
          report = reports.reduce((acc, curr) => {
            acc.data.converted = [...acc.data.converted, ...curr.data.converted];
            return acc;
          }, initialValue);
        }
      } else {
        report = await Report.findOne({ type, date });
      }

      if (report) {
        res.json(report);
      } else {
        res.status(404).send({ message: "Item doesn't exist" });
      }
    })
  );

  return router;
};
