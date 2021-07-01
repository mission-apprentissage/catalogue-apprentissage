const express = require("express");
const Boom = require("boom");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { getQueryFromRule } = require("../../common/utils/rulesUtils");
const { getNiveauxDiplomesTree } = require("@mission-apprentissage/tco-service-node");
const { ReglePerimetre, ConvertedFormation } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/perimetre/niveau",
    tryCatch(async (req, res) => {
      const tree = await getNiveauxDiplomesTree();

      const niveauxTree = await Promise.all(
        Object.entries(tree).map(async ([niveau, diplomes]) => {
          return {
            niveau: {
              value: niveau,
              count: await ConvertedFormation.countDocuments(getQueryFromRule({ niveau })),
            },
            diplomes: await Promise.all(
              diplomes.map(async (diplome) => {
                return {
                  value: diplome,
                  count: await ConvertedFormation.countDocuments(getQueryFromRule({ niveau, diplome })),
                };
              })
            ),
          };
        })
      );

      return res.json(niveauxTree);
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

  router.get(
    "/perimetre/regle/count",
    tryCatch(async (req, res) => {
      const niveau = req.query?.niveau;
      const diplome = req.query?.diplome;
      const regle_complementaire = req.query?.regle_complementaire;

      if (!niveau || !diplome) {
        throw Boom.badRequest();
      }

      const result = await ConvertedFormation.countDocuments(
        getQueryFromRule({ niveau, diplome, regle_complementaire })
      );
      return res.json(result);
    })
  );

  return router;
};
