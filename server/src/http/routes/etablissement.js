const express = require("express");
const Joi = require("joi");
const { oleoduc, transformIntoJSON, transformIntoCSV } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { sendJsonStream, sendCsvStream } = require("../../common/utils/httpUtils");
const { paginate } = require("../../common/utils/mongooseUtils");
const { Etablissement } = require("../../common/model");
const { sanitize, SAFE_FIND_OPERATORS } = require("../../common/utils/sanitizeUtils");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  const defaultFilter = {
    published: true,
  };

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
      const sanitizedQuery = sanitize(req.query);

      let { query, page, limit } = await Joi.object({
        query: Joi.string().default("{}"),
        page: Joi.number().default(1),
        limit: Joi.number().default(10),
      }).validateAsync(sanitizedQuery, { abortEarly: false });

      let json = JSON.parse(query);

      // Par défaut, ne retourne que les établissements published
      if (!sanitizedQuery?.query) {
        Object.assign(json, defaultFilter);
      }

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

  router.post(
    "/etablissements",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.body, SAFE_FIND_OPERATORS);

      let { query, page, limit, select } = await Joi.object({
        query: Joi.object().default(defaultFilter),
        page: Joi.number().default(1),
        limit: Joi.number().default(10),
        select: Joi.optional(),
      }).validateAsync(sanitizedQuery, { abortEarly: false });

      const { find, pagination } = await paginate(Etablissement, query, { page, limit, select });
      const stream = oleoduc(
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
    "/etablissements.json",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

      let { query, limit } = await Joi.object({
        query: Joi.string().default("{}"),
        limit: Joi.number().default(10),
      }).validateAsync(sanitizedQuery, { abortEarly: false });

      let json = JSON.parse(query);

      // Par défaut, ne retourne que les établissements published
      if (!sanitizedQuery?.query) {
        Object.assign(json, defaultFilter);
      }

      const stream = oleoduc(Etablissement.find(json).limit(limit).cursor(), transformIntoJSON());
      return sendJsonStream(stream, res);
    })
  );

  router.get(
    "/etablissements.csv",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

      let { query, limit } = await Joi.object({
        query: Joi.string().default("{}"),
        limit: Joi.number().default(10),
      }).validateAsync(sanitizedQuery, { abortEarly: false });

      let json = JSON.parse(query);

      // Par défaut, ne retourne que les établissements published
      if (!sanitizedQuery?.query) {
        Object.assign(json, defaultFilter);
      }

      const stream = oleoduc(
        Etablissement.find(json).limit(limit).lean().cursor(),
        transformIntoCSV({ mapper: (v) => `"${v || ""}"` })
      );
      return sendCsvStream(stream, res);
    })
  );

  /**
   * Get count etablissements/count GET
   */
  router.get(
    "/etablissements/count",
    tryCatch(async (req, res) => {
      const qs = req.query;
      let query = qs && qs.query ? JSON.parse(qs.query) : {};
      query = sanitize(query, SAFE_FIND_OPERATORS);

      // Par défaut, ne retourne que les établissements published
      if (!qs?.query) {
        Object.assign(query, defaultFilter);
      }

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
      const qs = req.query;
      let query = qs && qs.query ? JSON.parse(qs.query) : {};
      query = sanitize(query, SAFE_FIND_OPERATORS);

      // Par défaut, ne retourne que les établissements published
      if (!qs?.query) {
        Object.assign(query, defaultFilter);
      }

      const retrievedData = await Etablissement.findOne(query);
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Etablissement doesn't exist` });
    })
  );

  /**
   * Get etablissement by id /etablissement/{id} GET
   */
  router.get(
    "/etablissement/:id",
    tryCatch(async (req, res) => {
      const sanitizedParams = sanitize(req.params);
      const itemId = sanitizedParams.id;
      try {
        const retrievedData = await Etablissement.findById(itemId);
        if (retrievedData) {
          res.json(retrievedData);
        } else {
          res.status(404).json({ message: `Etablissement ${itemId} doesn't exist` });
        }
      } catch (e) {
        res.status(404).json({ message: `Etablissement ${itemId} doesn't exist` });
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
   *           siret:
   *             value: { query: "{\"siret\": \"13001727000401\"}" }
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
   */
  router.get(
    "/etablissements/siret-uai",
    tryCatch(async (req, res) => {
      const qs = req.query;
      let query = qs && qs.query ? JSON.parse(qs.query) : {};
      query = sanitize(query, SAFE_FIND_OPERATORS);

      // Par défaut, ne retourne que les établissements published
      if (!qs?.query) {
        Object.assign(query, defaultFilter);
      }

      const etablissements = await Etablissement.find(query, {
        _id: 0,
        siret: 1,
        uai: 1,
      }).lean();

      return res.json({
        etablissements,
      });
    })
  );

  return router;
};
