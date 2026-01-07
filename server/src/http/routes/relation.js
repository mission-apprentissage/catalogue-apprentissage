const express = require("express");
const Joi = require("joi");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Relation, Etablissement } = require("../../common/models");
const { sanitize, SAFE_FIND_OPERATORS, SAFE_UPDATE_OPERATORS } = require("../../common/utils/sanitizeUtils");
const { siretFormat } = require("../../common/models/format");
const { diffEntity, buildUpdatesHistory } = require("../../logic/common/utils/diffUtils");
const logger = require("../../common/logger");
const Boom = require("boom");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  const getRelation = tryCatch(async (req, res) => {
    const qs = req.query;

    let query = qs && qs.query ? JSON.parse(qs.query) : {};
    query = sanitize(query, SAFE_FIND_OPERATORS);

    await Joi.object({
      siret_responsable: Joi.string().regex(siretFormat).default(null),
      siret_formateur: Joi.string().regex(siretFormat).default(null),
    }).validateAsync(query, { abortEarly: false });

    const relation = await Relation.findOne(query).lean();
    if (relation) {
      return res.json(relation);
    }
    return res.status(404).send({ message: `Item doesn't exist` });
  });

  const putRelation = tryCatch(async ({ body, user, params }, res) => {
    const sanitizedParams = sanitize(params, SAFE_UPDATE_OPERATORS);
    const payload = sanitize(body, SAFE_UPDATE_OPERATORS);

    const itemId = sanitizedParams.id;

    console.log(itemId);

    const relation = await Relation.findById(itemId, { updates_history: 0 });

    if (!relation) {
      throw Boom.notFound();
    }

    console.log(relation);

    const responsable = await Etablissement.findOne({ siret: relation.siret_responsable });
    const formateur = await Etablissement.findOne({ siret: relation.siret_formateur });

    let hasRightToEdit = user.isAdmin;
    if (!hasRightToEdit) {
      const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
      hasRightToEdit =
        listAcademie.includes(-1) ||
        listAcademie.includes(Number(responsable.num_academie)) ||
        listAcademie.includes(Number(formateur.num_academie));
    }

    if (!hasRightToEdit) {
      throw Boom.unauthorized();
    }

    logger.info({ type: "http" }, "Updating new item: ", payload);

    const updatedRelation = { ...relation };

    if (payload.email_responsable) {
      logger.info(
        { type: "http" },
        `Updating email_responsable for relation ${relation.siret_responsable} / ${relation.siret_formateur} to  ${payload.email_responsable}`
      );

      updatedRelation.email_responsable = payload.email_responsable;
      updatedRelation.editedFields = { ...updatedRelation.editedFields, email_responsable: payload.email_responsable };
      updatedRelation.last_update_who = user.email;
      updatedRelation.last_update_at = new Date();
    }

    const { updates, keys, length } = diffEntity(relation, updatedRelation);

    console.log({ updates, keys, length });

    const result = await Relation.findOneAndUpdate(
      { _id: itemId },
      {
        $set: updates,
        ...(length
          ? {
              $push: {
                updates_history: buildUpdatesHistory(relation, updates, keys),
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
  });

  /**
   * @swagger
   *
   * /entity/relation:
   *   get:
   *     summary: Permet de récupérer une relation spécifique
   *     tags:
   *       - Relations
   *     description: >
   *       Permet, à l'aide de critères, de rechercher dans les relations entre établissement proposant des formations en apprentissage <br/><br/>
   *       Le champ Query est une query Mongo stringify<br/><br/>
   *       **Pour definir vos critères de recherche veuillez regarder le schéma formation (en bas de cette page)**
   *     parameters:
   *       - in: query
   *         name: siret_responsable
   *         required: true
   *         schema:
   *           type: string
   *         example: "78467169500087"
   *       - in: query
   *         name: siret_formateur
   *         required: true
   *         schema:
   *           type: string
   *         example: "78467169500087"
   *     responses:
   *       200:
   *         description: OK
   *       404:
   *         description: KO
   */
  router.get("/relation", getRelation);

  /**
   * @swagger
   *
   * /entity/relations/{id}:
   *   put:
   *     summary: Mise à jour d'une formation.
   *     tags:
   *       - Formations
   *     description: >
   *       Cette route vous permet de mettre à jour les informations d'une relation donnée.<br/><br/>
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
   *       description: L'objet JSON **doit** contenir la clé **email**.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email_responsable
   *             properties:
   *               email_responsable:
   *                 type: string
   *     responses:
   *       200:
   *         description: OK, retourne la formation mise à jour
   *         content:
   *            application/json:
   *              schema:
   *                   $ref: '#/components/schemas/formation'
   */
  router.put("/relations/:id", putRelation);

  return router;
};
