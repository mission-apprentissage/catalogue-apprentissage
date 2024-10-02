const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const logger = require("../../common/logger");
const { getElasticInstance } = require("../../common/esClient");
const Boom = require("boom");

const esClient = getElasticInstance();

module.exports = () => {
  const router = express.Router();
  router.post(
    "/:index/_search",
    tryCatch(async (req, res) => {
      const { index } = req.params;
      logger.debug({ type: "http" }, `Es search ${index}`);
      const result = await esClient.search({ index, ...req.query, body: req.body });

      return res.json(result);
    })
  );

  router.post(
    "/:index/_count",
    tryCatch(async (req, res) => {
      const { index } = req.params;
      logger.debug({ type: "http" }, `Es count ${index}`);

      const result = await esClient.count({
        index,
        ...req.query,
        body: req.body,
      });

      logger.debug({ type: "http" }, `Es count ${index} results ${JSON.stringify(result)}`);

      return res.json(result);
    })
  );

  router.post(
    "/:index/_msearch",
    tryCatch(async (req, res) => {
      const { index } = req.params;
      logger.debug({ type: "http" }, `Es Multi search ${index}`);
      const result = await esClient.msearch({ index, ...req.query, body: req.body, rest_total_hits_as_int: true });

      return res.json(result);
    })
  );

  router.post(
    "/:index/scroll",
    tryCatch(async (req, res) => {
      const { index } = req.params;
      logger.debug({ type: "http" }, `Es scroll search ${index}`);

      let qs = req.query;

      let scroll_id = null;
      if (qs && qs.scroll_id) {
        scroll_id = qs.scroll_id;
      }

      if (scroll_id) {
        const response = await esClient.scroll({
          scroll_id,
          scroll: "1m",
        });
        return res.json(response);
      }

      if (!req.body || req.body === "") {
        throw Boom.badImplementation("something went wrong");
      }

      const result = await esClient.search({
        index,
        scroll: "1m",
        size: 100,
        body: req.body,
      });

      return res.json(result);
    })
  );

  return router;
};
