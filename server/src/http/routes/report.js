const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Report } = require("../../common/models");
const { oleoduc, transformIntoJSON } = require("oleoduc");
const { sendJsonStream } = require("../../common/utils/httpUtils");
const { sanitize } = require("../../common/utils/sanitizeUtils");

module.exports = () => {
  const router = express.Router();

  /**
   * Get Reports /reports.json GET
   */
  router.get(
    "/reports",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

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
