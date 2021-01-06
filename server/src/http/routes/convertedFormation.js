const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { ConvertedFormation } = require("../../common/model");
const { mnaFormationUpdater } = require("../../logic/updaters/mnaFormationUpdater");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  /**
   * Get all converted RCO formations /formations2021 GET
   * */
  router.get(
    "/formations2021",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;

      const allData = await ConvertedFormation.paginate(query, { page, limit });
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

  /**
   * Get count converted RCO formations formations2021/count GET
   */
  router.get(
    "/formations2021/count",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const retrievedData = await ConvertedFormation.countDocuments(query);
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Item doesn't exist` });
    })
  );

  /**
   * Get one converted RCO formation by query /formation2021 GET
   */
  router.get(
    "/formation2021",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const retrievedData = await ConvertedFormation.findOne(query);
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Item doesn't exist` });
    })
  );

  /**
   * Get one converted RCO formation by id  /formation2021/{id} GET
   */
  router.get(
    "/formation2021/:id",
    tryCatch(async (req, res) => {
      const itemId = req.params.id;
      const retrievedData = await ConvertedFormation.findById(itemId);
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Item ${itemId} doesn't exist` });
    })
  );

  /**
   * Get updated formation
   */
  router.post(
    "/formation2021/update",
    tryCatch(async (req, res) => {
      const formation = req.body;
      const { formation: updatedFormation, error } = await mnaFormationUpdater(formation, {
        withHistoryUpdate: false,
      });

      if (error) {
        return res.status(500).send({ message: error });
      }

      return res.json(updatedFormation);
    })
  );

  return router;
};
