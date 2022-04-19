const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Report } = require("../../common/model");
const { oleoduc, transformIntoJSON } = require("oleoduc");
const { sendJsonStream } = require("../../common/utils/httpUtils");
const mongoSanitize = require("express-mongo-sanitize");

module.exports = () => {
  const router = express.Router();

  /**
   * Get Reports /reports.ndjson GET
   */
  router.get(
    "/reports",
    tryCatch(async (req, res) => {
      const sanitizedQuery = mongoSanitize.sanitize(req.query);

      const { type, date, minDate, maxDate, uuidReport } = sanitizedQuery;
      let filter;

      if (minDate && maxDate) {
        filter =
          uuidReport !== "null"
            ? {
                type,
                uuid: uuidReport,
              }
            : {
                type,
                date: { $gte: new Date(minDate), $lt: new Date(maxDate) },
              };
      } else {
        filter = { type, date };
        if (uuidReport !== "null") {
          filter.uuid = uuidReport;
        }
      }

      let stream = oleoduc(Report.find(filter).cursor(), transformIntoJSON());

      return sendJsonStream(stream, res);
    })
  );

  return router;
};
