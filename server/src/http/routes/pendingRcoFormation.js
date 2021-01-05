const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { PendingRcoFormation } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  router.post(
    "/pendingRcoFormation",
    tryCatch(async (req, res) => {
      const payload = req.body;
      const result = await PendingRcoFormation.findOneAndUpdate(
        { id_rco_formation: payload.id_rco_formation },
        payload,
        {
          upsert: true,
          new: true,
        }
      );
      res.json(result);
    })
  );

  router.put(
    "/pendingRcoFormation",
    tryCatch(async (req, res) => {
      const payload = req.body;
      const result = await PendingRcoFormation.findOneAndUpdate(
        { id_rco_formation: payload.id_rco_formation },
        payload,
        { new: true }
      );
      res.json(result);
    })
  );

  /**
   * Get all items
   */
  router.get(
    "/pendingRcoFormations",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;

      const allData = await PendingRcoFormation.paginate(query, { page, limit });
      return res.json({
        formations: allData.docs,
        pagination: {
          page: allData.page,
          resultats_par_page: limit,
          nombre_de_page: allData.pages,
          total: allData.total,
        },
      });
    })
  );

  router.get(
    "/pendingRcoFormation/:id",
    tryCatch(async (req, res) => {
      const id = req.params.id;

      const formation = await PendingRcoFormation.findOne({ id_rco_formation: id });
      if (formation) {
        return res.json(formation);
      }
      return res.status(404).send({ message: "Item doesn't exist" });
    })
  );

  return router;
};
