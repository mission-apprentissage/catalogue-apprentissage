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
      const { type, date, page = 1 } = req.query;

      const data = await Report.paginate({ type, date }, { page, limit: 1 });
      if (data) {
        return res.json({
          report: data.docs[0],
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
