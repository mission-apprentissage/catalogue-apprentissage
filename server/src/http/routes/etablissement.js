const express = require("express");
const Joi = require("joi");
const Boom = require("boom");
const { isValidObjectId } = require("mongoose");
const { oleoduc, transformIntoJSON, transformIntoCSV } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { sendJsonStream, sendCsvStream } = require("../../common/utils/httpUtils");
const { paginate } = require("../../common/utils/mongooseUtils");
const { Etablissement } = require("../../common/models");
const { sanitize, SAFE_FIND_OPERATORS, SAFE_UPDATE_OPERATORS } = require("../../common/utils/sanitizeUtils");
const { hasAccessTo } = require("../../common/utils/rolesUtils");
const logger = require("../../common/logger");
const { siretFormat } = require("../../common/models/format");
const { diffEtablissement, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");

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

      let { query, limit, sort, skip } = await Joi.object({
        query: Joi.string().default("{}"),
        limit: Joi.number().default(10),
        sort: Joi.string().default("{}"),
        skip: Joi.number().default(0),
      }).validateAsync(sanitizedQuery, { abortEarly: false });

      let json = JSON.parse(query);

      // Par défaut, ne retourne que les établissements published
      if (!sanitizedQuery?.query) {
        Object.assign(json, defaultFilter);
      }

      const stream = oleoduc(
        Etablissement.find(json).sort(JSON.parse(sort)).limit(limit).skip(skip).cursor(),
        transformIntoJSON()
      );
      return sendJsonStream(stream, res);
    })
  );

  router.get(
    "/etablissements.csv",
    tryCatch(async (req, res) => {
      const sanitizedQuery = sanitize(req.query);

      let { query, limit, sort, skip } = await Joi.object({
        query: Joi.string().default("{}"),
        limit: Joi.number().default(10),
        sort: Joi.string().default("{}"),
        skip: Joi.number().default(0),
      }).validateAsync(sanitizedQuery, { abortEarly: false });

      let json = JSON.parse(query);

      // Par défaut, ne retourne que les établissements published
      if (!sanitizedQuery?.query) {
        Object.assign(json, defaultFilter);
      }

      const stream = oleoduc(
        Etablissement.find(json).sort(JSON.parse(sort)).limit(limit).lean().skip(skip).cursor(),
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

      const count = await Etablissement.countDocuments(query);

      res.json(count);
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

      const etablissement = await Etablissement.findOne(query);

      if (!etablissement) {
        throw Boom.notFound(`Aucun établissement ne correspond aux critères transmis.`);
      }
      return res.json(etablissement);
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

      if (!(siretFormat.test(itemId) || isValidObjectId(itemId))) {
        throw Boom.badRequest("L'identifiant de l'établissement n'est pas valide");
      }

      const etablissement =
        (await Etablissement.findOne({ siret: itemId }).lean()) ?? (await Etablissement.findById(itemId).lean());

      if (!etablissement) {
        throw Boom.notFound(`L'établissement ${itemId} n'existe pas.`);
      }

      return res.json(etablissement);
    })
  );

  /**
   * Update etablissement by id /etablissement/{id} PUT
   */
  router.put(
    "/etablissement/:id",
    tryCatch(async (req, res) => {
      const user = req.session.passport.user;
      const payload = sanitize(req.body, SAFE_UPDATE_OPERATORS);
      const sanitizedParams = sanitize(req.params);
      const itemId = sanitizedParams.id;

      if (!(siretFormat.test(itemId) || isValidObjectId(itemId))) {
        throw Boom.badRequest("L'identifiant de l'établissement n'est pas valide");
      }

      const etablissement =
        (await Etablissement.findOne({ siret: itemId }, { updates_history: 0 })) ??
        (await Etablissement.findById(itemId, { updates_history: 0 }));

      if (!etablissement) {
        throw Boom.notFound(`L'établissement ${itemId} n'existe pas.`);
      }

      if (!hasAccessTo(user, "page_formation/gestion_publication", etablissement.num_academie)) {
        throw Boom.unauthorized();
      }

      logger.info({ type: "http" }, "Updating etablissement: ", payload);

      const updatedEtablissement = { ...etablissement };

      if (payload.email_direction) {
        logger.info(
          { type: "http" },
          `Updating email_direction for etablissement ${etablissement.siret} to ${payload.email_direction}`
        );

        updatedEtablissement.email_direction = payload.email_direction;
        updatedEtablissement.editedFields = {
          ...updatedEtablissement.editedFields,
          email_direction: payload.email_direction,
        };
        updatedEtablissement.last_update_who = user.email;
        updatedEtablissement.last_update_at = new Date();
      }

      const { updates, keys, length } = diffEtablissement(etablissement, updatedEtablissement);

      console.log({ updates, keys, length });

      const result = await Etablissement.findOneAndUpdate(
        { _id: etablissement._id },
        {
          $set: updates,
          ...(length
            ? {
                $push: {
                  updates_history: buildUpdatesHistory(etablissement, updates, keys),
                },
              }
            : {}),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.json(result);
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
   *         examples:
   *           "Recherche par siret":
   *             value: { query: "{\"siret\": \"13001727000401\"}" }
   *             summary: Recherche par siret
   *           "Recherche par Siret et UAI":
   *             value: { query: "{\"siret\": \"13001727000401\", \"uai\": \"0781981E\"}" }
   *             summary: Recherche par siret et Uai
   *           "Recherche par Siret ou UAI":
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
