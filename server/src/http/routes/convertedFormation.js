const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { ConvertedFormation, PsFormation2021 } = require("../../common/model");
const { mnaFormationUpdater } = require("../../logic/updaters/mnaFormationUpdater");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  /**
   * @swagger
   *
   * /entity/formations2021:
   *   get:
   *     summary: Permet de récupérer les formations 2021
   *     tags:
   *       - Formations
   *     description: >
   *       Permet, à l'aide de critères, de rechercher dans les formations en apprentissage 2021 <br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma mnaFormation (en bas de cette page)**<br/><br/>
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
   *                      $ref: '#/components/schemas/mnaFormation'
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
    "/formations2021",
    tryCatch(async (req, res) => {
      let qs = req.query;

      // FIXME: ugly patch because request from Affelnet is not JSON valid
      const strQuery = qs?.query ?? "";
      const cleanedQuery = strQuery.replace(
        /"num_academie" :(0.)/,
        (found, capture) => `"num_academie":"${Number(capture)}"`
      );
      // end FIXME

      const query = cleanedQuery ? JSON.parse(cleanedQuery) : {};

      const { id_parcoursup, ...filter } = query;
      // additional filtering for parcoursup
      if (id_parcoursup) {
        const psFormations = await PsFormation2021.find(
          { id_parcoursup, matching_mna_formation: { $size: 1 } },
          { matching_mna_formation: 1 }
        ).lean();
        const ids = psFormations.reduce((acc, { matching_mna_formation }) => {
          return [...acc, ...matching_mna_formation.map(({ _id }) => _id)];
        }, []);
        filter["_id"] = { $in: ids };
      }

      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;
      const select =
        qs && qs.select
          ? JSON.parse(qs.select)
          : { affelnet_statut_history: 0, parcoursup_statut_history: 0, updates_history: 0, __v: 0 };

      let queryAsRegex = qs && qs.queryAsRegex ? JSON.parse(qs.queryAsRegex) : {};
      for (const prop in queryAsRegex) {
        queryAsRegex[prop] = new RegExp(queryAsRegex[prop]);
      }

      const mQuery = {
        ...filter,
        ...queryAsRegex,
      };

      const allData = await ConvertedFormation.paginate(mQuery, {
        page,
        limit,
        lean: true,
        select,
      });
      return res.json({
        formations: allData.docs,
        pagination: {
          page: allData.page,
          resultats_par_page: limit,
          nombre_de_page: allData.pages,
          total: allData.total,
        },
      });
    })
  );

  router.post(
    "/formations2021",
    tryCatch(async (req, res) => {
      let qs = req.body;
      console.log(qs);

      // FIXME: ugly patch because request from Affelnet is not JSON valid
      const strQuery = qs?.query ?? "";
      const cleanedQuery = strQuery.replace(
        /"num_academie" :(0.)/,
        (found, capture) => `"num_academie":"${Number(capture)}"`
      );
      // end FIXME

      const query = cleanedQuery ? JSON.parse(cleanedQuery) : {};

      const { id_parcoursup, ...filter } = query;
      // additional filtering for parcoursup
      if (id_parcoursup) {
        const psFormations = await PsFormation2021.find(
          { id_parcoursup, matching_mna_formation: { $size: 1 } },
          { matching_mna_formation: 1 }
        ).lean();
        const ids = psFormations.reduce((acc, { matching_mna_formation }) => {
          return [...acc, ...matching_mna_formation.map(({ _id }) => _id)];
        }, []);
        filter["_id"] = { $in: ids };
      }

      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;
      const select = qs?.select
        ? JSON.parse(qs.select)
        : { affelnet_statut_history: 0, parcoursup_statut_history: 0, updates_history: 0, __v: 0 };

      let queryAsRegex = qs && qs.queryAsRegex ? JSON.parse(qs.queryAsRegex) : {};
      for (const prop in queryAsRegex) {
        queryAsRegex[prop] = new RegExp(queryAsRegex[prop]);
      }

      const mQuery = {
        ...filter,
        ...queryAsRegex,
      };

      const allData = await ConvertedFormation.paginate(mQuery, {
        page,
        limit,
        lean: true,
        select,
      });
      return res.json({
        formations: allData.docs,
        pagination: {
          page: allData.page,
          resultats_par_page: limit,
          nombre_de_page: allData.pages,
          total: allData.total,
        },
      });
    })
  );

  /**
   * @swagger
   *
   * /entity/formations2021/count:
   *   get:
   *     summary: Permet de récupérer le nombre de formations 2021
   *     tags:
   *       - Formations
   *     description: >
   *       Permet, à l'aide de critères, de récupérer le nombre de formations en apprentissage 2021 <br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma mnaFormation (en bas de cette page)**
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
  router.get(
    "/formations2021/count",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const count = await ConvertedFormation.countDocuments(query);
      return res.json(count);
    })
  );

  /**
   * Get one converted RCO formation by query /formation2021 GET
   */
  router.get(
    "/formation2021",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const select =
        qs && qs.select
          ? JSON.parse(qs.select)
          : { affelnet_statut_history: 0, parcoursup_statut_history: 0, updates_history: 0, __v: 0 };
      const retrievedData = await ConvertedFormation.findOne(query, select).lean();
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Item doesn't exist` });
    })
  );

  /**
   * @swagger
   *
   * /entity/formation2021/{id}:
   *   get:
   *     summary: Permet de récupérer une formation 2021 spécifique
   *     tags:
   *       - Formations
   *     description: >
   *       Permet, à l'aide de critères, de rechercher dans les formations en apprentissage 2021 <br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma mnaFormation (en bas de cette page)**
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
  router.get(
    "/formation2021/:id",
    tryCatch(async (req, res) => {
      const itemId = req.params.id;
      const qs = req.query;
      const select =
        qs && qs.select
          ? JSON.parse(qs.select)
          : { affelnet_statut_history: 0, parcoursup_statut_history: 0, updates_history: 0, __v: 0 };
      const retrievedData = await ConvertedFormation.findById(itemId, select).lean();
      if (retrievedData) {
        return res.json(retrievedData);
      }
      return res.status(404).send({ message: `Item ${itemId} doesn't exist` });
    })
  );

  /**
   * Get updated formation
   */
  router.post(
    "/formation2021/update",
    tryCatch(async (req, res) => {
      const formation = req.body;
      const { formation: updatedFormation, error } = await mnaFormationUpdater(formation, {
        withHistoryUpdate: false,
        withCodePostalUpdate: true,
      });

      if (formation.uai_formation) {
        updatedFormation.uai_formation = formation.uai_formation;
      }

      if (error) {
        return res.status(500).send({ message: error });
      }

      return res.json(updatedFormation);
    })
  );

  return router;
};
