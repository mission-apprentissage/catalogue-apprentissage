const express = require("express");
const Joi = require("joi");
const { oleoduc, compose, transformIntoJSON, transformIntoCSV } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Formation, CampagneStart } = require("../../common/models");
const { sendJsonStream, sendCsvStream } = require("../../common/utils/httpUtils");
const { sanitize, SAFE_FIND_OPERATORS } = require("../../common/utils/sanitizeUtils");
const { paginate } = require("../../common/utils/mongooseUtils");
const { COMMON_STATUS } = require("../../constants/status");

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
    const cleanedQuery = strQuery
      // fix bad json from affelnet
      .replace(/"num_academie" :(0.)/, (found, capture) => `"num_academie":"${Number(capture)}"`)
      // fix deprecated status
      .replace("en attente de publication", COMMON_STATUS.PRET_POUR_INTEGRATION);
    // end FIXME

    let query = cleanedQuery ? JSON.parse(cleanedQuery) : {};
    query = sanitize(query, SAFE_FIND_OPERATORS);

    const { id_parcoursup, ...filter } = query;
    // additional filtering for parcoursup
    if (id_parcoursup) {
      filter["parcoursup_id"] = id_parcoursup;
    }

    const page = qs && qs.page ? qs.page : 1;
    const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;
    const sort = qs && qs.sort ? JSON.parse(qs.sort) : {};
    const select =
      qs && qs.select
        ? JSON.parse(qs.select)
        : {
            affelnet_statut_history: 0,
            parcoursup_statut_history: 0,
            // updates_history: 0,
            __v: 0,
          };

    let queryAsRegex = qs?.queryAsRegex ? JSON.parse(qs.queryAsRegex) : {};
    queryAsRegex = sanitize(queryAsRegex, SAFE_FIND_OPERATORS);

    for (const prop in queryAsRegex) {
      queryAsRegex[prop] = new RegExp(queryAsRegex[prop], "i");
    }

    const mQuery = {
      ...filter,
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
      sort,
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

    // const { find, pagination } = await paginate(Formation, query, { page, limit, select, sort });
    // const stream = oleoduc(
    //   find.cursor(),
    //   transformIntoJSON({
    //     arrayWrapper: {
    //       pagination,
    //     },
    //     arrayPropertyName: "formations",
    //   })
    // );

    // return sendJsonStream(stream, res);
  });

  const postFormations = tryCatch(async (req, res) => {
    const sanitizedQuery = sanitize(req.body, SAFE_FIND_OPERATORS);

    let { query, page, limit, sort, select, queryAsRegex } = await Joi.object({
      query: Joi.optional().default({}),
      page: Joi.number().default(1),
      limit: Joi.number().max(1000).default(10),
      select: Joi.optional().default({
        affelnet_statut_history: 0,
        parcoursup_statut_history: 0,
        updates_history: 0,
        __v: 0,
      }),
      sort: Joi.optional().default({}),
      queryAsRegex: Joi.optional().default({}),
    }).validateAsync(sanitizedQuery, { abortEarly: false });

    const { id_parcoursup, ...filter } = query;
    // additional filtering for parcoursup
    if (id_parcoursup) {
      filter["parcoursup_id"] = id_parcoursup;
    }

    for (const prop in queryAsRegex) {
      queryAsRegex[prop] = new RegExp(queryAsRegex[prop], "i");
    }

    query = {
      ...filter,
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

    // FIXME: ugly patch because request from Affelnet is not JSON valid
    const strQuery = qs?.query ?? "";
    const cleanedQuery = strQuery
      // fix bad json from affelnet
      .replace(/"num_academie" :(0.)/, (found, capture) => `"num_academie":"${Number(capture)}"`)
      // fix deprecated status
      .replace("en attente de publication", COMMON_STATUS.PRET_POUR_INTEGRATION);
    // end FIXME

    let query = cleanedQuery ? JSON.parse(cleanedQuery) : {};
    query = sanitize(query, SAFE_FIND_OPERATORS);

    const { id_parcoursup, ...filter } = query;
    // additional filtering for parcoursup
    if (id_parcoursup) {
      filter["parcoursup_id"] = id_parcoursup;
    }

    let queryAsRegex = qs?.queryAsRegex ? JSON.parse(qs.queryAsRegex) : {};
    queryAsRegex = sanitize(queryAsRegex, SAFE_FIND_OPERATORS);

    for (const prop in queryAsRegex) {
      queryAsRegex[prop] = new RegExp(queryAsRegex[prop], "i");
    }

    const mQuery = {
      ...filter,
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
    query = sanitize(query, SAFE_FIND_OPERATORS);

    const select =
      qs && qs.select
        ? JSON.parse(qs.select)
        : {
            affelnet_statut_history: 0,
            parcoursup_statut_history: 0,
            updates_history: 0,
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

    const itemId = decodeURIComponent(sanitizedParams.id);
    const select =
      qs && qs.select
        ? JSON.parse(qs.select)
        : {
            affelnet_statut_history: 0,
            parcoursup_statut_history: 0,
            updates_history: 0,
            __v: 0,
          };
    const retrievedDataByCleME = await Formation.findOne({ cle_ministere_educatif: itemId }, select).lean();
    if (retrievedDataByCleME) {
      return res.json(retrievedDataByCleME);
    }
    const retrievedDataById = await Formation.findById(itemId, select).lean();
    if (retrievedDataById) {
      return res.json(retrievedDataById);
    }

    return res.status(404).send({ message: `Item ${itemId} doesn't exist` });
  });

  const streamFormationsJSON = tryCatch(async (req, res) => {
    let { query, select, limit, sort, skip } = await Joi.object({
      query: Joi.string().default("{}"),
      select: Joi.string().default(
        '{"affelnet_statut_history":0,"parcoursup_statut_history":0,"updates_history":0,"__v":0}'
      ),
      limit: Joi.number().default(10),
      sort: Joi.string().default("{}"),
      skip: Joi.number().default(0),
    }).validateAsync(req.query, { abortEarly: false });

    let filter = JSON.parse(query);
    filter = sanitize(filter, SAFE_FIND_OPERATORS);

    const stream = compose(
      Formation.find(filter, JSON.parse(select)).sort(JSON.parse(sort)).limit(limit).skip(skip).cursor(),
      transformIntoJSON()
    );
    return sendJsonStream(stream, res);
  });

  const streamFormationsCSV = tryCatch(async (req, res) => {
    let { query, select, limit, sort, skip } = await Joi.object({
      query: Joi.string().default("{}"),
      select: Joi.string().default(
        '{"affelnet_statut_history":0,"parcoursup_statut_history":0,"updates_history":0,"__v":0}'
      ),
      limit: Joi.number().default(10),
      sort: Joi.string().default("{}"),
      skip: Joi.number().default(0),
    }).validateAsync(req.query, { abortEarly: false });

    let filter = JSON.parse(query);
    filter = sanitize(filter, SAFE_FIND_OPERATORS);

    const stream = compose(
      Formation.find(filter, JSON.parse(select)).sort(JSON.parse(sort)).limit(limit).skip(skip).lean().cursor(),
      transformIntoCSV({ mapper: (v) => `"${v || ""}"` })
    );
    return sendCsvStream(stream, res);
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
   *               maximum: 1000
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
  router.post("/formations", postFormations);

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

  /**
   * Get one converted RCO formation by query /formation GET
   */
  router.get("/formation", getFormation);

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

  /**
   * Stream formations as json array
   */
  router.get("/formations.json", streamFormationsJSON);

  /**
   * @swagger
   *
   * /entity/formations.csv:
   *   get:
   *     summary: Permet de récupérer un stream des formations au format CSV
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
   *             sort:
   *               type: number
   *               example: 1
   *             limit:
   *               type: number
   *               example: 10
   *             skip:
   *               type: number
   *               example: 20
   *             select:
   *               type: string
   *               example: '"{\"cfd\": 1, \"intitule_long\": 1}"'
   *         examples:
   *           cfd:
   *             value: { query: "{\"cfd\": \"40022106\"}", select: "{\"cle_ministere_educatif\": 1}", skip: 0, limit: 10 }
   *             summary: Recherche par CFD
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
   *            text/csv:
   *              schema:
   *                type: string
   */
  router.get("/formations.csv", streamFormationsCSV);

  return router;
};
