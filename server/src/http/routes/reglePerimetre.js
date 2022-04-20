const express = require("express");
const Boom = require("boom");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { getQueryFromRule, titresRule, getPublishedRules } = require("../../common/utils/rulesUtils");
const { getNiveauxDiplomesTree } = require("@mission-apprentissage/tco-service-node");
const { ReglePerimetre, Formation } = require("../../common/model");
const { sanitize } = require("../../common/utils/sanitizeUtils");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/perimetre/niveau",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

      const plateforme = sanitizedQuery?.plateforme;
      if (!plateforme) {
        throw Boom.badRequest();
      }

      const tree = await getNiveauxDiplomesTree();

      const diplomesCounts = await Formation.aggregate([
        {
          $match: {
            ...getPublishedRules(plateforme),
            ...titresRule,
          },
        },
        {
          $group: {
            _id: {
              niveau: "$niveau",
              diplome: "$diplome",
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const counts = diplomesCounts.reduce((acc, { _id, count }) => {
        acc[_id.niveau] = acc[_id.niveau] ?? 0;
        acc[_id.niveau] += count;

        acc[`${_id.niveau}-${_id.diplome}`] = count;
        return acc;
      }, {});

      const niveauxTree = Object.entries(tree).map(([niveau, diplomes]) => {
        return {
          niveau: {
            value: niveau,
            count: counts[niveau] ?? 0,
          },
          diplomes: diplomes.map((diplome) => {
            return {
              value: diplome,
              count: counts[`${niveau}-${diplome}`] ?? 0,
            };
          }),
        };
      });

      return res.json(niveauxTree);
    })
  );

  router.get(
    "/perimetre/regles",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

      const plateforme = sanitizedQuery?.plateforme;
      const condition_integration = sanitizedQuery?.condition_integration;
      const nom_regle_complementaire = sanitizedQuery?.nom_regle_complementaire;
      const statut = sanitizedQuery?.statut;

      if (!plateforme) {
        throw Boom.badRequest();
      }

      const filter = {
        plateforme,
        is_deleted: { $ne: true },
      };

      if (condition_integration) {
        filter.condition_integration = condition_integration;
      }

      if (statut) {
        filter.statut = statut;
      }

      if (nom_regle_complementaire) {
        filter.nom_regle_complementaire = nom_regle_complementaire === "null" ? null : nom_regle_complementaire;
      }

      const result = await ReglePerimetre.find(filter).lean();
      return res.json(result);
    })
  );

  router.get(
    "/perimetre/regle/count",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

      const plateforme = sanitizedQuery?.plateforme;
      const niveau = sanitizedQuery?.niveau;
      const diplome = sanitizedQuery?.diplome;
      const regle_complementaire = sanitizedQuery?.regle_complementaire;
      const num_academie = sanitizedQuery?.num_academie === "null" ? null : sanitizedQuery?.num_academie;
      const duree = sanitizedQuery?.duree;
      const annee = sanitizedQuery?.annee;

      if (!plateforme || !niveau) {
        throw Boom.badRequest();
      }

      const result = await Formation.countDocuments(
        getQueryFromRule({ plateforme, niveau, diplome, regle_complementaire, num_academie, duree, annee })
      );
      return res.json(result);
    })
  );

  router.get(
    "/perimetre/regles/integration/count",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

      const plateforme = sanitizedQuery?.plateforme;
      const num_academie = sanitizedQuery?.num_academie;
      const niveau = sanitizedQuery?.niveau;

      if (!plateforme) {
        throw Boom.badRequest();
      }

      const filter = {
        plateforme,
        ...(niveau && niveau !== "null" ? { niveau } : {}),
        condition_integration: { $in: ["peut intégrer", "doit intégrer"] },
        is_deleted: { $ne: true },
      };

      const rules = await ReglePerimetre.find(filter).lean();

      if (rules.length === 0) {
        return res.json({ nbRules: rules.length, nbFormations: 0 });
      }

      const result = await Formation.countDocuments({
        ...(num_academie && num_academie !== "null" ? { num_academie } : {}),
        $or: rules.map(getQueryFromRule),
      });

      return res.json({ nbRules: rules.length, nbFormations: result });
    })
  );

  return router;
};
