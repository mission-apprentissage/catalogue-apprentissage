const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const logger = require("../../common/logger");
const { getElasticInstance } = require("../../common/esClient");

const esClient = getElasticInstance();

module.exports = () => {
  const router = express.Router();
  router.post(
    "/:index/_search",
    tryCatch(async (req, res) => {
      const { index } = req.params;
      logger.info(`Es search ${index}`);
      const result = await esClient.search({ index, ...req.query, body: req.body });

      return res.json(result.body);
    })
  );

  router.post(
    "/:index/_msearch",
    tryCatch(async (req, res) => {
      const { index } = req.params;
      logger.info(`Es Multi search ${index}`);
      const result = await esClient.msearch({ index, ...req.query, body: req.body });

      return res.json(result.body);
    })
  );

  return router;
};
