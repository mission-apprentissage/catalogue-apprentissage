const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const { ConvertedFormation } = require("../../common/model");
const logger = require("../../common/logger");
const Boom = require("boom");

/**
 * Schema for validation
 */
const formationSchema = Joi.object({
  num_academie: Joi.string().required(),
}).unknown();

module.exports = () => {
  const router = express.Router();

  /**
   * @swagger
   *
   * /entity/formations2021/{id}:
   *   put:
   *     summary: Mise à jour d'une formation.
   *     tags:
   *       - Formations
   *     description: >
   *       Cette route vous permet de mettre à jour les informations d'une formation donnée.<br/><br/>
   *       **Seulement sur les champs statut**
   *     security:
   *       - bearerAuth: []
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
   *                 enum: ["hors périmètre", "publié", "non publié", "à publier", "en attente de publication"]
   *               parcoursup_statut:
   *                 type: string
   *                 enum: ["hors périmètre", "publié", "non publié", "à publier", "en attente de publication"]
   *     responses:
   *       200:
   *         description: OK, retourne la formation mise à jour
   *         content:
   *            application/json:
   *              schema:
   *                   $ref: '#/components/schemas/mnaFormation'
   */
  router.put(
    "/formations2021/:id",
    tryCatch(async ({ body, user, params }, res) => {
      await formationSchema.validateAsync(body, { abortEarly: false });

      const itemId = params.id;

      const formation = await ConvertedFormation.findById(itemId);
      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",");
        hasRightToEdit = listAcademie.includes(`${formation.num_academie}`);
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      logger.info("Updating new item: ", body);
      const result = await ConvertedFormation.findOneAndUpdate({ _id: itemId }, body, { new: true });
      res.json(result);
    })
  );

  return router;
};
