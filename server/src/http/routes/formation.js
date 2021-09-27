const express = require("express");
const Joi = require("joi");
const { oleoduc, transformData } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { MnaFormation } = require("../../common/model");
const { sendJsonStream } = require("../../common/utils/httpUtils");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  /**
   * Get all formations getTrainings /formations GET
   * */
  router.get(
    "/formations",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;

      const allData = await MnaFormation.paginate(query, { page, limit });
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
   * Get countTrainings formations/count GET
   */
  router.get(
    "/formations/count",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const retrievedData = await MnaFormation.countDocuments(query);
      if (retrievedData) {
        res.json(retrievedData);
      } else {
        res.json({ message: `Item doesn't exist` });
      }
    })
  );

  /**
   * Get formation getTraining  /formation GET
   */
  router.get(
    "/formation",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const retrievedData = await MnaFormation.findOne(query);
      if (retrievedData) {
        res.json(retrievedData);
      } else {
        res.json({ message: `Item doesn't exist` });
      }
    })
  );

  /**
   * Get formation by id getTrainingById /formation/{id} GET
   */
  router.get(
    "/formation/:id",
    tryCatch(async (req, res) => {
      const itemId = req.params.id;
      const retrievedData = await MnaFormation.findById(itemId);
      if (retrievedData) {
        res.json(retrievedData);
      } else {
        res.json({ message: `Item ${itemId} doesn't exist` });
      }
    })
  );

  /**
   * Fetch formations as ndjson
   */
  router.get(
    "/formations.ndjson",
    tryCatch(async (req, res) => {
      let { query, limit } = await Joi.object({
        query: Joi.string().default("{}"),
        limit: Joi.number().default(10),
      }).validateAsync(req.query, { abortEarly: false });

      const filter = JSON.parse(query);

      const stream = oleoduc(
        MnaFormation.find(filter).limit(limit).cursor(),
        transformData((formation) => `${JSON.stringify(formation)}\n`)
      );

      return sendJsonStream(stream, res);
    })
  );

  return router;
};
