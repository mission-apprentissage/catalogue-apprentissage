const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Report, ConvertedFormation } = require("../../common/model");
const { asyncForEach } = require("../../common/utils/asyncUtils");

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

        // Fix if id_rco not defined in report
        if (type === "trainingsUpdate" && report.data?.updated && !report.data.updated?.[0].id_rco_formation) {
          const maj = [];
          await asyncForEach(report.data?.updated || [], async ({ id, ...rest }) => {
            const res = await ConvertedFormation.findOne({ _id: id }, { id_rco_formation: 1 }).lean();
            maj.push({
              ...rest,
              ...res,
            });
          });
          report.data.updated = maj;
        }

        // Fix if _id not defined in report
        if (type === "rcoConversion" && !report.data.converted[0]._id) {
          try {
            const maj = [];
            await asyncForEach(report.data.converted, async ({ id_rco_formation, ...rest }) => {
              const cF = await ConvertedFormation.findOne({ id_rco_formation }).lean();
              if (cF) {
                maj.push({
                  ...rest,
                  _id: cF._id,
                  id_rco_formation,
                });
              } else {
                maj.push({
                  ...rest,
                  id_rco_formation,
                });
              }
            });
            report.data.converted = maj;
          } catch (error) {
            console.log(error);
          }
        }

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
