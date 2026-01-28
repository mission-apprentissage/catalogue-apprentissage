const express = require("express");
const Joi = require("joi");
const Boom = require("boom");
const { oleoduc, compose, transformIntoJSON, transformIntoCSV, transformData } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Formation, CandidatureRelation } = require("../../common/models");
const { sendJsonStream, sendCsvStream } = require("../../common/utils/httpUtils");
const { sanitize, SAFE_FIND_OPERATORS, SAFE_UPDATE_OPERATORS } = require("../../common/utils/sanitizeUtils");
const { paginate } = require("../../common/utils/mongooseUtils");
const { COMMON_STATUS } = require("../../constants/status");
const logger = require("../../common/logger");
const { hasAccessTo, hasOneOfRoles, hasAcademyRight } = require("../../common/utils/rolesUtils");
const { updateOneTagsHistory } = require("../../logic/updaters/tagsHistoryUpdater");
const { validateUAI } = require("../../common/utils/uaiUtils");
const { isValidObjectId } = require("mongoose");
const { cleMinistereEducatifFormat } = require("../../common/models/format");

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

    const { find, pagination } = await paginate(Formation, query, { page, limit: Math.min(limit, 1000), select, sort });
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
    const formation = await Formation.findOne(query, select).lean();

    if (!formation) {
      throw Boom.notFound(`Aucune formation ne correspond aux critères transmis.`);
    }

    return res.json(formation);
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

    if (!(cleMinistereEducatifFormat.test(itemId) || isValidObjectId(itemId))) {
      throw Boom.badRequest("L'identifiant de la formation n'est pas valide");
    }

    const formation =
      (await Formation.findOne({ cle_ministere_educatif: itemId }, select).lean()) ??
      (await Formation.findById(itemId, select).lean());

    if (!formation) {
      throw Boom.notFound(`La formation ${itemId} n'existe pas.`);
    }

    return res.json(formation);
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

  const putFormation = tryCatch(async (req, res) => {
    const user = req.session.passport.user;
    const sanitizedParams = sanitize(req.params, SAFE_UPDATE_OPERATORS);
    const payload = sanitize(req.body, SAFE_UPDATE_OPERATORS);

    const itemId = sanitizedParams.id;

    if (!(cleMinistereEducatifFormat.test(itemId) || isValidObjectId(itemId))) {
      throw Boom.badRequest("L'identifiant de la formation n'est pas valide");
    }

    const formation =
      (await Formation.findOne({ cle_ministere_educatif: itemId }).lean()) ?? (await Formation.findById(itemId).lean());

    if (!formation) {
      throw Boom.notFound();
    }

    if (!hasAcademyRight(user, formation.num_academie)) {
      throw Boom.unauthorized();
    }

    logger.info({ type: "http" }, "Updating formation: ", payload);

    if (payload.uai_formation) {
      logger.info(
        { type: "http" },
        `Updating uai_formation ${formation.uai_formation} to ${payload.uai_formation} for ${formation.cle_ministere_educatif}`
      );

      if (!(await validateUAI(payload.uai_formation))) {
        throw Boom.badRequest(`${payload.uai_formation} n'est pas un code UAI valide.`);
      }

      //     if (
      //       formation.etablissement_formateur_code_commune_insee !== formation.code_commune_insee &&
      //       payload.uai_formation.trim() === formation.etablissement_formateur_uai
      //     ) {
      //       /**
      //        * NOTE:
      //        * On autorise les instructeurs à saisir le même UAI que pour le formateur même si le code_commune_insee est différent à partir d'une certaine date.
      //        * Date à modifier chaque année.
      //        */
      //       const parcoursupAllowSameUaiDate = new Date("2023-12-15T00:00:00.000Z");
      //       // TODO : Pour AFFELNET, date en attente de confirmation par la DGESCO.
      //       const affelnetAllowSameUaiDate = new Date("2024-03-14T00:00:00.000Z");

      //       if (
      //         (new Date().getTime() < parcoursupAllowSameUaiDate.getTime() &&
      //           formation.parcoursup_statut !== PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT) ||
      //         (new Date().getTime() < affelnetAllowSameUaiDate.getTime() &&
      //           formation.affelnet_statut !== AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT) ||
      //         (formation.affelnet_statut === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT &&
      //           formation.parcoursup_statut === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT)
      //       ) {
      //         throw Boom.badRequest(
      //           `Le code commune Insee du lieu de formation (${formation.code_commune_insee}, ${formation.localite}) est différent de celui du formateur (${formation.etablissement_formateur_code_commune_insee}, ${formation.etablissement_formateur_localite}). \
      // L'UAI du lieu de formation doit donc être différent de celui du formateur. Il vous appartient de vérifier auprès de l'OFA que le lieu de formation est correct et de saisir l'UAI correspondant. \
      // Si vous pensez qu’il y a une erreur sur l’une de ces données, veuillez vous rapprocher du Carif-Oref.`
      //         );
      //       }
      //     }
    }

    const result = await Formation.findOneAndUpdate(
      { _id: formation._id },
      {
        ...payload,
        ...(payload.uai_formation ? { uai_formation: payload.uai_formation.trim(), uai_formation_valide: true } : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
  });

  const handleRejection = tryCatch(async (req, res) => {
    const user = req.session?.passport?.user;
    const sanitizedParams = sanitize(req.params);
    const itemId = sanitizedParams.id;
    const date = new Date();

    if (!(cleMinistereEducatifFormat.test(itemId) || isValidObjectId(itemId))) {
      throw Boom.badRequest("L'identifiant de la formation n'est pas valide");
    }

    const formation =
      (await Formation.findOne({ cle_ministere_educatif: itemId }).lean()) ?? (await Formation.findById(itemId).lean());

    if (!formation) {
      throw Boom.notFound();
    }

    if (
      !(
        hasOneOfRoles(user, ["admin", "moss"]) ||
        (hasAcademyRight(user, formation.num_academie) && !formation?.rejection?.handled_by)
      )
    ) {
      throw Boom.unauthorized();
    }

    logger.debug({ type: "http" }, `Prise en charge de la formation rejetée ${itemId} par ${user.email}`);

    const result = await Formation.findOneAndUpdate(
      { _id: formation._id },
      {
        last_update_who: user.email,
        "rejection.handled_by": user.email,
        "rejection.handled_date": date,
        $push: {
          updates_history: {
            from: { rejection: { handled_by: null, handled_date: null } },
            to: {
              last_update_who: user.email,
              rejection: {
                handled_by: user.email,
                handled_date: date,
              },
            },
            updated_at: date,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
  });

  const unhandleRejection = tryCatch(async (req, res) => {
    const user = req.session?.passport?.user;
    const sanitizedParams = sanitize(req.params);
    const itemId = sanitizedParams.id;

    if (!(cleMinistereEducatifFormat.test(itemId) || isValidObjectId(itemId))) {
      throw Boom.badRequest("L'identifiant de la formation n'est pas valide");
    }

    const formation =
      (await Formation.findOne({ cle_ministere_educatif: itemId }).lean()) ?? (await Formation.findById(itemId).lean());

    if (!formation) {
      throw Boom.notFound();
    }

    if (
      !(
        hasOneOfRoles(user, ["admin", "moss"]) ||
        (hasAcademyRight(user, formation.num_academie) && formation?.rejection?.handled_by === user.email)
      )
    ) {
      throw Boom.unauthorized();
    }

    logger.debug(
      { type: "http" },
      `Annulation de la prise en charge de la formation rejetée ${itemId} par ${user.email}`
    );

    const result = await Formation.findOneAndUpdate(
      { _id: formation._id },
      {
        last_update_who: user.email,
        "rejection.handled_by": null,
        "rejection.handled_date": null,
        $push: {
          updates_history: {
            from: {
              rejection: {
                handled_by: formation?.rejection?.handled_by,
                handled_date: formation?.rejection?.handled_date,
              },
            },
            to: {
              last_update_who: user.email,
              rejection: {
                handled_by: null,
                handled_date: null,
              },
            },
            updated_at: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
  });

  const reinitParcoursupStatut = tryCatch(async (req, res) => {
    const user = req.session?.passport?.user;
    const sanitizedParams = sanitize(req.params);
    const sanitizedBody = sanitize(req.body);
    const itemId = sanitizedParams.id;
    const comment = sanitizedBody.comment;
    const date = new Date();

    if (!(cleMinistereEducatifFormat.test(itemId) || isValidObjectId(itemId))) {
      throw Boom.badRequest("L'identifiant de la formation n'est pas valide");
    }

    const formation =
      (await Formation.findOne({ cle_ministere_educatif: itemId }).lean()) ?? (await Formation.findById(itemId).lean());

    if (!hasAccessTo(user, "page_formation/reinit_parcoursup")) {
      throw Boom.unauthorized();
    }

    logger.debug(
      { type: "http" },
      `Réinitialisation des informations de publication PARCOURSUP de la formation ${itemId} par ${user.email}`
    );

    const update = {
      parcoursup_statut: formation?.parcoursup_statut_initial,
      parcoursup_id: null,
      last_update_who: user.email,
      parcoursup_statut_reinitialisation: {
        user: user.email,
        date,
        comment,
      },
    };

    await Formation.findOneAndUpdate(
      { _id: formation._id },
      {
        ...update,
        $push: {
          updates_history: {
            from: {
              parcoursup_statut: formation?.parcoursup_statut,
              parcoursup_id: formation?.parcoursup_id,
              last_update_who: formation?.last_update_who,
              parcoursup_statut_reinitialisation: {
                user: formation?.parcoursup_statut_reinitialisation?.user,
                date: formation?.parcoursup_statut_reinitialisation?.date,
                comment: formation?.parcoursup_statut_reinitialisation?.comment,
              },
            },
            to: {
              ...update,
            },
            updated_at: date,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    await updateOneTagsHistory("parcoursup_statut", itemId);

    const result = await Formation.findOne({ _id: formation._id });

    // TODO : comprendre pourquoi ça n'est pas automatiquement appelé lors d'appel à findOneAndUpdate...
    result.index();

    res.json(result);
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

  /**
   * @swagger
   *
   * /entity/formations/{id}:
   *   put:
   *     summary: Mise à jour d'une formation.
   *     tags:
   *       - Formations
   *     description: >
   *       Cette route vous permet de mettre à jour les informations d'une formation donnée.<br/><br/>
   *       **Seulement sur les champs statut**
   *     security:
   *       - cookieAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         example: "5fc6166c712d48a9881333c5"
   *     requestBody:
   *       description: L'objet JSON **doit** contenir la clé **num_academie**.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - num_academie
   *             properties:
   *               num_academie:
   *                 type: string
   *               affelnet_statut:
   *                 type: string
   *                 enum: ["non publiable en l'état", "publié", "non publié", "à publier (soumis à validation)", "à publier", "prêt pour intégration"]
   *               parcoursup_statut:
   *                 type: string
   *                 enum: ["non publiable en l'état", "publié", "non publié", "à publier (sous condition habilitation)", "à publier (vérifier accès direct postbac)", "à publier (soumis à validation Recteur)", "à publier", "prêt pour intégration"]
   *     responses:
   *       200:
   *         description: OK, retourne la formation mise à jour
   *         content:
   *            application/json:
   *              schema:
   *                   $ref: '#/components/schemas/formation'
   */
  router.put("/formations/:id", putFormation);
  /**
   * @deprecated User /entity/formations/{id} instead.
   */
  router.put("/formations2021/:id", putFormation);

  router.post("/formations/:id/handle-rejection", handleRejection);
  router.post("/formations/:id/unhandle-rejection", unhandleRejection);

  router.post("/formations/:id/reinit-parcoursup-statut", reinitParcoursupStatut);

  /**
   * Route spécifique à futurepro (ex "c'est qui le pro")
   * Retourne la liste des cle_ministere_educatif et des uai_formation associées sur le périmètre Affelnet
   */
  router.get(
    "/future-pro",
    tryCatch(async (req, res) => {
      const user = req.session?.passport?.user;

      if (!hasAccessTo(user, "page_other/future-pro")) {
        return Boom.unauthorized();
      }

      const results = await Formation.find(
        { affelnet_perimetre: true },
        { _id: 0, cle_ministere_educatif: 1, uai_formation: 1 }
      );

      res.json(results);
    })
  );

  return router;
};
