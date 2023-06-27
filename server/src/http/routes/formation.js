const express = require("express");
const Joi = require("joi");
const { oleoduc, compose, transformIntoJSON } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Formation } = require("../../common/model");
const { sendJsonStream } = require("../../common/utils/httpUtils");
const { sanitize } = require("../../common/utils/sanitizeUtils");
const { paginate } = require("../../common/utils/mongooseUtils");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  const defaultFilter = {
    catalogue_published: true,
    published: true,
  };

  const getFormations = tryCatch(async (req, res) => {
    const qs = req.query;

    // FIXME: ugly patch because request from Affelnet is not JSON valid
    const strQuery = qs?.query ?? "";
    const cleanedQuery = strQuery.replace(
      /"num_academie" :(0.)/,
      (found, capture) => `"num_academie":"${Number(capture)}"`
    );
    // end FIXME

    let query = cleanedQuery ? JSON.parse(cleanedQuery) : {};
    query = sanitize(query, { allowSafeOperators: true });

    const page = qs && qs.page ? qs.page : 1;
    const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;
    const select =
      qs && qs.select
        ? JSON.parse(qs.select)
        : {
            __v: 0,
          };

    let queryAsRegex = qs?.queryAsRegex ? JSON.parse(qs.queryAsRegex) : {};
    queryAsRegex = sanitize(queryAsRegex, { allowSafeOperators: true });

    for (const prop in queryAsRegex) {
      queryAsRegex[prop] = new RegExp(queryAsRegex[prop], "i");
    }

    const mQuery = {
      ...query,
      ...queryAsRegex,
    };

    // Par défaut, ne retourne que le catalogue général.
    if (!qs?.query && !qs?.queryAsRegex) {
      Object.assign(mQuery, defaultFilter);
    }

    const allData = await Formation.paginate(mQuery, {
      page,
      limit: Math.min(limit, 1000),
      lean: true,
      select,
    });
    return res.json({
      formations: allData.docs,
      pagination: {
        page: allData.page,
        resultats_par_page: Math.min(limit, 1000),
        nombre_de_page: allData.pages,
        total: allData.total,
      },
    });
  });

  const postFormations = tryCatch(async (req, res) => {
    const sanitizedQuery = sanitize(req.body, { allowSafeOperators: true });

    let { query, page, limit, select, sort, queryAsRegex } = await Joi.object({
      query: Joi.optional().default({}),
      page: Joi.number().default(1),
      limit: Joi.number().max(1000).default(10),
      sort: Joi.optional().default({}),
      select: Joi.optional().default({
        __v: 0,
      }),
      queryAsRegex: Joi.optional().default({}),
    }).validateAsync(sanitizedQuery, { abortEarly: false });

    for (const prop in queryAsRegex) {
      queryAsRegex[prop] = new RegExp(queryAsRegex[prop], "i");
    }

    query = {
      ...query,
      ...queryAsRegex,
    };

    // Par défaut, ne retourne que le catalogue général.
    if (!sanitizedQuery?.query && !sanitizedQuery?.queryAsRegex) {
      Object.assign(query, defaultFilter);
    }

    const { find, pagination } = await paginate(Formation, query, { page, limit, select, sort });
    const stream = oleoduc(
      find.cursor(),
      transformIntoJSON({
        arrayWrapper: {
          pagination,
        },
        arrayPropertyName: "formations",
      })
    );

    return sendJsonStream(stream, res);
  });

  const countFormations = tryCatch(async (req, res) => {
    const qs = req.query;
    let query = qs && qs.query ? JSON.parse(qs.query) : {};
    query = sanitize(query, { allowSafeOperators: true });

    let queryAsRegex = qs?.queryAsRegex ? JSON.parse(qs.queryAsRegex) : {};
    queryAsRegex = sanitize(queryAsRegex, { allowSafeOperators: true });

    for (const prop in queryAsRegex) {
      queryAsRegex[prop] = new RegExp(queryAsRegex[prop], "i");
    }

    const mQuery = {
      ...query,
      ...queryAsRegex,
    };

    // Par défaut, ne retourne que le catalogue général.
    if (!qs?.query && !qs?.queryAsRegex) {
      Object.assign(mQuery, defaultFilter);
    }

    const count = await Formation.countDocuments(mQuery);
    return res.json(count);
  });

  const getFormation = tryCatch(async (req, res) => {
    const qs = req.query;

    let query = qs && qs.query ? JSON.parse(qs.query) : {};
    query = sanitize(query, { allowSafeOperators: true });

    const select =
      qs && qs.select
        ? JSON.parse(qs.select)
        : {
            __v: 0,
          };
    const retrievedData = await Formation.findOne(query, select).lean();
    if (retrievedData) {
      return res.json(retrievedData);
    }
    return res.status(404).send({ message: `Item doesn't exist` });
  });

  const getFormationById = tryCatch(async (req, res) => {
    const qs = sanitize(req.query);
    const sanitizedParams = sanitize(req.params);

    const itemId = sanitizedParams.id;
    const select =
      qs && qs.select
        ? JSON.parse(qs.select)
        : {
            __v: 0,
          };
    const retrievedData = await Formation.findById(itemId, select).lean();
    if (retrievedData) {
      return res.json(retrievedData);
    }
    return res.status(404).send({ message: `Item ${itemId} doesn't exist` });
  });

  const streamFormations = tryCatch(async (req, res) => {
    let { query, select, limit } = await Joi.object({
      query: Joi.string().default("{}"),
      select: Joi.string().default('{"__v":0}'),
      limit: Joi.number().default(10),
    }).validateAsync(req.query, { abortEarly: false });

    let filter = JSON.parse(query);
    filter = sanitize(filter, { allowSafeOperators: true });

    const selector = JSON.parse(select);

    const stream = compose(Formation.find(filter, selector).limit(limit).cursor(), transformIntoJSON());
    return sendJsonStream(stream, res);
  });

  /**
   * @swagger
   *
   * /entity/formations:
   *   get:
   *     summary: Permet de récupérer les formations
   *     tags:
   *       - Formations
   *     description: >
   *       Permet, à l'aide de critères, de rechercher dans les formations en apprentissage<br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma formation (en bas de cette page)**<br/><br/>
   *       champ **select**: Selection du ou des champs retournés, nom_du_champ: 1 pour l'inclure dans le retour
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
   *               example: '"{\"cfd\": \"40022106\"}"'
   *             queryAsRegex:
   *               type: string
   *               example: "{\"onisep_intitule\": \"^bac pro Cuisine$\"}"
   *             page:
   *               type: number
   *               example: 1
   *             limit:
   *               type: number
   *               example: 10
   *             select:
   *               type: string
   *               example: '"{\"cfd\": 1, \"intitule_long\": 1}"'
   *         examples:
   *           cfd:
   *             value: { query: "{\"cfd\": \"40022106\"}", page: 1, limit: 10 }
   *             summary: Recherche par CFD
   *           intituleLong:
   *             value: { queryAsRegex: "{\"intitule_long\": \"^CUISINE\"}", page: 1, limit: 10 }
   *             summary: Recherche par intitulé long BCN
   *           intituleOnisep:
   *             value: { queryAsRegex: "{\"onisep_intitule\": \"^bac pro Cuisine$\"}", page: 1, limit: 10 }
   *             summary: Recherche par intitulé Onisep
   *           siretM:
   *             value: { query: "{\"$or\":[{\"etablissement_formateur_siret\":\"79128914300020\"},{\"etablissement_gestionnaire_siret\":\"13001727000310\"}]}" }
   *             summary: Recherche par siret multiple
   *           siretS:
   *             value: { query: "{\"etablissement_gestionnaire_siret\": \"13001727000310\"}" }
   *             summary: Recherche par siret simple
   *           siretSelect:
   *             value: { query: "{\"etablissement_gestionnaire_siret\": \"13001727000310\"}", select: "{\"cfd\": 1, \"intitule_long\": 1}" }
   *             summary: Recherche avec selection des champs retournés
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  formations:
   *                    type: array
   *                    items:
   *                      $ref: '#/components/schemas/formation'
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
  router.get("/formations", getFormations);
  router.get("/formations2021", getFormations);

  router.post("/formations", postFormations);
  router.post("/formations2021", postFormations);

  /**
   * @swagger
   *
   * /entity/formations/count:
   *   get:
   *     summary: Permet de récupérer le nombre de formations
   *     tags:
   *       - Formations
   *     description: >
   *       Permet, à l'aide de critères, de récupérer le nombre de formations en apprentissage <br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma formation (en bas de cette page)**
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
   *               example: '"{\"cfd\": \"40022106\"}"'
   *     responses:
   *       200:
   *         description: OK
   *       404:
   *         description: KO
   */
  router.get("/formations/count", countFormations);
  router.get("/formations2021/count", countFormations);

  /**
   * Get one converted RCO formation by query /formation GET
   */
  router.get("/formation", getFormation);
  router.get("/formation2021", getFormation);

  /**
   * @swagger
   *
   * /entity/formation/{id}:
   *   get:
   *     summary: Permet de récupérer une formation spécifique
   *     tags:
   *       - Formations
   *     description: >
   *       Permet, à l'aide de critères, de rechercher dans les formations en apprentissage <br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma formation (en bas de cette page)**
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: "5fc6166c712d48a9881333c5"
   *     responses:
   *       200:
   *         description: OK
   *       404:
   *         description: KO
   */
  router.get("/formation/:id", getFormationById);
  router.get("/formation2021/:id", getFormationById);

  /**
   * Stream formations as json array
   */
  router.get("/formations.json", streamFormations);
  router.get("/formations2021.json", streamFormations);

  return router;
};
