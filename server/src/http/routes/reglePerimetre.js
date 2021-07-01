const express = require("express");
const Boom = require("boom");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { getNiveauxDiplomesTree } = require("@mission-apprentissage/tco-service-node");
const { ReglePerimetre } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/perimetre/niveau",
    tryCatch(async (req, res) => {
      const tree = await getNiveauxDiplomesTree();
      return res.json(tree);
    })
  );

  router.get(
    "/perimetre/regles",
    tryCatch(async (req, res) => {
      const plateforme = req.query?.plateforme;
      if (!plateforme) {
        throw Boom.badRequest();
      }

      const result = await ReglePerimetre.find({ plateforme }).lean();
      return res.json(result);
    })
  );

  return router;
};
