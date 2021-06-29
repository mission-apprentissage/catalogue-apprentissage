const express = require("express");
const Boom = require("boom");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { ConvertedFormation, ReglePerimetre } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/perimetre/niveau",
    tryCatch(async (req, res) => {
      // get all "niveaux" available in all formations
      const result = await ConvertedFormation.distinct("niveau");
      return res.json(result);
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
