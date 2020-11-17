const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const logger = require("../../common/logger");
const { getElasticInstance } = require("../../common/esClient");

const esClient = getElasticInstance();

module.exports = () => {
  const router = express.Router();

  router.post(
    "/_msearch",
    tryCatch(async (req, res) => {
      logger.info(`Es Multi search no index ${req.body}`);
      const result = await esClient.msearch({ body: [req.body] });

      return res.json(result.body);
    })
  );

  return router;
};
