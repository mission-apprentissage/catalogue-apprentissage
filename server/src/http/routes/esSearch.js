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
      logger.info(`Es search ${index}`);
      const result = await esClient.search({ index, ...req.query, body: req.body });

      return res.json(result.body);
    })
  );

  router.post(
    "/:index/_count",
    tryCatch(async (req, res) => {
      const { index } = req.params;

      console.log("================");

      // const result = await esClient.count({
      //   index,
      //   ...req.query,
      //   body: req.body,
      // });
      const result = await esClient.count({
        index,
        body: {
          query: {
            bool: {
              must: [
                { match: { etablissement_reference_catalogue_published: true } },
                { match: { published: true } },
                { match: { "etablissement_formateur_siret.keyword": "41387086600105" } },
              ],
              // should: [
              //   {
              //     term: {
              //       "etablissement_formateur_siret.keyword": "41387086600105",
              //     },
              //   },
              //   {
              //     term: {
              //       "etablissement_gestionnaire_siret.keyword": "41387086600105",
              //     },
              //   },
              // ],
            },
          },
        },
      });

      return res.json({
        index,
        result: result.body,
        body: req.body,
      });
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

  router.post(
    "/:index/scroll",
    tryCatch(async (req, res) => {
      const { index } = req.params;
      logger.info(`Es scrool search ${index}`);

      let qs = req.query;

      let scrollId = null;
      if (qs && qs.scroll_id) {
        scrollId = qs.scroll_id;
      }

      if (scrollId) {
        const response = await esClient.scroll({
          scrollId,
          scroll: "1m",
        });
        return res.json(response.body);
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

      return res.json(result.body);
    })
  );

  return router;
};
