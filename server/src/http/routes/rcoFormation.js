const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { RcoFormation } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  /**
   * Get all items
   */
  router.get(
    "/items",
    tryCatch(async (req, res) => {
      const qs = req.query;
      let query;
      let page;
      let limit;
      try {
        query = qs && qs.query ? JSON.parse(qs.query) : {};
        page = qs && qs.page ? qs.page : 1;
        limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;
      } catch (e) {
        return res.status(400).send({ error: "invalid query params" });
      }

      const results = await RcoFormation.paginate(query, { page, limit });

      return res.json({
        formations: results.docs,
        pagination: {
          page: results.page,
          resultats_par_page: limit,
          nombre_de_page: results.pages,
          total: results.total,
        },
      });
    })
  );

  return router;
};
