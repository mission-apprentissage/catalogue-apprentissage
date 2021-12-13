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
        return res.json(report);
      } else {
        res.status(404).send({ message: "Item doesn't exist" });
      }
    })
  );

  /**
   * Get Reports /reports GET
   */
  router.get(
    "/reports",
    tryCatch(async (req, res) => {
      const { type, date, minDate, maxDate, page = 1, uuidReport } = req.query;
      let data = null;

      if (minDate && maxDate) {
        const filter =
          uuidReport !== "null"
            ? {
                type,
                uuid: uuidReport,
              }
            : {
                type,
                date: { $gte: new Date(minDate), $lt: new Date(maxDate) },
              };
        data = await Report.paginate(filter, { page, limit: 1 });
      } else {
        const filter = { type, date };
        if (uuidReport !== "null") {
          filter.uuid = uuidReport;
        }
        data = await Report.paginate(filter, { page, limit: 1 });
      }

      if (data?.docs?.[0]) {
        const report = data.docs[0];

        return res.json({
          report,
          pagination: {
            page: data.page,
            resultats_par_page: 1,
            nombre_de_page: data.pages,
            total: data.total,
          },
        });
      } else {
        res.status(404).send({ message: "Item doesn't exist" });
      }
    })
  );

  return router;
};
