const express = require("express");
const Joi = require("joi");
const { oleoduc, transformIntoJSON, transformData } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { sendJsonStream } = require("../../common/utils/httpUtils");
const { paginate } = require("../../common/utils/mongooseUtils");
const { Etablissement } = require("../../common/model");
const { getEtablissementUpdates } = require("@mission-apprentissage/tco-service-node");
const { isApiEntrepriseUp } = require("../../common/utils/apiUtils");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  /**
   * @swagger
   *
   * /entity/etablissements:
   *   get:
   *     summary: Permet de récupérer les établissements
   *     tags:
   *       - Etablissements
   *     description: >
   *       Permet, à l'aide de critères, de rechercher dans la table établissements<br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma etablissement (en bas de cette page)**
   *     parameters:
   *       - in: query
   *         name: payload
   *         required: true
   *         schema:
   *           type: object
   *           required:
   *             - query
   *           properties:
   *             query:
   *               type: string
   *               example: '"{\"siret\": \"13001727000401\"}"'
   *             page:
   *               type: number
   *               example: 1
   *             limit:
   *               type: number
   *               example: 10
   *         examples:
   *           siret:
   *             value: { query: "{\"siret\": \"13001727000401\"}", page: 1, limit: 10 }
   *             summary: Recherche par siret
   *           sireteUAI:
   *             value: { query: "{\"siret\": \"13001727000401\", \"uai\": \"0781981E\"}" }
   *             summary: Recherche par siret et Uai
   *           siretoUai:
   *             value: { query: "{\"$or\":[{\"siret\":\"13001727000310\"},{\"uai\":\"0781981E\"}]}" }
   *             summary: Recherche par siret **OU** par Uai
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  etablissements:
   *                    type: array
   *                    items:
   *                      $ref: '#/components/schemas/etablissement'
   *                  pagination:
   *                    type: object
   *                    properties:
   *                      page:
   *                        type: string
   *                      resultats_par_page:
   *                        type: number
   *                      nombre_de_page:
   *                        type: number
   *                      total:
   *                        type: number
   */
  router.get(
    "/etablissements",
    tryCatch(async (req, res) => {
      let { query, page, limit } = await Joi.object({
        query: Joi.string().default("{}"),
        page: Joi.number().default(1),
        limit: Joi.number().default(10),
      }).validateAsync(req.query, { abortEarly: false });

      let json = JSON.parse(query);
      let { find, pagination } = await paginate(Etablissement, json, { page, limit });
      let stream = oleoduc(
        find.cursor(),
        transformIntoJSON({
          arrayWrapper: {
            pagination,
          },
          arrayPropertyName: "etablissements",
        })
      );

      return sendJsonStream(stream, res);
    })
  );

  router.get(
    "/etablissements.ndjson",
    tryCatch(async (req, res) => {
      let { query, limit } = await Joi.object({
        query: Joi.string().default("{}"),
        limit: Joi.number().default(10),
      }).validateAsync(req.query, { abortEarly: false });

      let json = JSON.parse(query);

      let stream = oleoduc(
        Etablissement.find(json).limit(limit).cursor(),
        transformData((etablissement) => `${JSON.stringify(etablissement)}\n`)
      );

      return sendJsonStream(stream, res);
    })
  );

  /**
   * Get count etablissements/count GET
   */
  router.get(
    "/etablissements/count",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const retrievedData = await Etablissement.countDocuments(query);
      if (retrievedData) {
        res.json(retrievedData);
      } else {
        res.json({ message: `Item doesn't exist` });
      }
    })
  );

  /**
   * Get etablissement  /etablissement GET
   */
  router.get(
    "/etablissement",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const retrievedData = await Etablissement.findOne(query);
      if (retrievedData) {
        res.json(retrievedData);
      } else {
        res.json({ message: `Etablissement doesn't exist` });
      }
    })
  );

  /**
   * Get etablissement by id /etablissement/{id} GET
   */
  router.get(
    "/etablissement/:id",
    tryCatch(async (req, res) => {
      const itemId = req.params.id;
      try {
        const retrievedData = await Etablissement.findById(itemId);
        if (retrievedData) {
          res.json(retrievedData);
        } else {
          res.json({ message: `Etablissement ${itemId} doesn't exist` });
        }
      } catch (e) {
        res.json({ message: `Etablissement ${itemId} doesn't exist` });
      }
    })
  );

  /**
   * @swagger
   *
   * /entity/etablissements/siret-uai:
   *   get:
   *     summary: Permet de recherche des établissements par siret ou/et uai ou/et adresse
   *     tags:
   *       - Etablissements
   *     description: >
   *       Permet, à l'aide de critères, de rechercher dans la table établissements<br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma etablissement (en bas de cette page)**
   *     parameters:
   *       - in: query
   *         name: payload
   *         required: true
   *         schema:
   *           type: object
   *           required:
   *             - query
   *           properties:
   *             query:
   *               type: string
   *               example: '"{\"siret\": \"13001727000401\"}"'
   *             page:
   *               type: number
   *               example: 1
   *             limit:
   *               type: number
   *               example: 10
   *         examples:
   *           adresse:
   *             value: { query: "{\"adresse\":\"2915 RtE DES BarTHES 40180\"}" }
   *             summary: Recherche par adresse
   *           siret:
   *             value: { query: "{\"siret\": \"13001727000401\"}", page: 1, limit: 10 }
   *             summary: Recherche par siret
   *           sireteUAI:
   *             value: { query: "{\"siret\": \"13001727000401\", \"uai\": \"0781981E\"}" }
   *             summary: Recherche par siret et Uai
   *           siretoUai:
   *             value: { query: "{\"$or\":[{\"siret\":\"13001727000310\"},{\"uai\":\"0781981E\"}]}" }
   *             summary: Recherche par siret **OU** par Uai
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  etablissements:
   *                    type: array
   *                    items:
   *                      $ref: '#/components/schemas/etablissement'
   *                  pagination:
   *                    type: object
   *                    properties:
   *                      page:
   *                        type: string
   *                      resultats_par_page:
   *                        type: number
   *                      nombre_de_page:
   *                        type: number
   *                      total:
   *                        type: number
   */
  router.get(
    "/etablissements/siret-uai",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 100000;

      const results = await Etablissement.paginate(query, {
        page,
        ...(limit ? { limit } : {}),
        select: { siret: 1, uai: 1 },
        lean: true,
        leanWithId: false,
      });

      return res.json({
        etablissements: results.docs,
        pagination: {
          page: results.page,
          resultats_par_page: limit,
          nombre_de_page: results.pages,
          total: results.total,
        },
      });
    })
  );

  router.post(
    "/etablissement/service",
    tryCatch(async (req, res) => {
      const serviceRequestSchema = Joi.object({
        siret: Joi.string().required(),
        scope: Joi.object().default(null),
      }).unknown();

      await serviceRequestSchema.validateAsync(req.body, { abortEarly: false });

      const { options = {}, ...item } = req.body;

      const scope = options.scope;
      const withHistoryUpdate = options.withHistoryUpdate ?? false;

      if ((!scope || Object.keys(scope).length === 0 || scope?.siret) && !(await isApiEntrepriseUp())) {
        res.json({ error: "L'API entreprise ne répond pas, mise à jour impossible" });
        return;
      }

      const result = await getEtablissementUpdates(item, { withHistoryUpdate, scope });
      return res.json(result);
    })
  );

  return router;
};
