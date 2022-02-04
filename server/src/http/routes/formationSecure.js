const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Formation } = require("../../common/model");
const logger = require("../../common/logger");
const Boom = require("boom");

module.exports = () => {
  const router = express.Router();

  const putFormation = tryCatch(async ({ body, user, params }, res) => {
    const itemId = params.id;

    const formation = await Formation.findById(itemId);
    let hasRightToEdit = user.isAdmin;
    if (!hasRightToEdit) {
      const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
      hasRightToEdit = listAcademie.includes(-1) || listAcademie.includes(Number(formation.num_academie));
    }
    if (!hasRightToEdit) {
      throw Boom.unauthorized();
    }

    logger.info("Updating new item: ", body);

    const result = await Formation.findOneAndUpdate(
      { _id: itemId },
      {
        ...body,
        ...(body.uai_formation ? { uai_formation: body.uai_formation.trim() } : {}),
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
   * /entity/formations/{id}:
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
   *                 enum: ["hors périmètre", "publié", "non publié", "à publier (soumis à validation)", "à publier", "en attente de publication"]
   *               parcoursup_statut:
   *                 type: string
   *                 enum: ["hors périmètre", "publié", "non publié", "à publier (sous condition habilitation)", "à publier (vérifier accès direct postbac)", "à publier (soumis à validation Recteur)", "à publier", "en attente de publication"]
   *     responses:
   *       200:
   *         description: OK, retourne la formation mise à jour
   *         content:
   *            application/json:
   *              schema:
   *                   $ref: '#/components/schemas/formation'
   */
  router.put("/formations/:id", putFormation);
  router.put("/formations2021/:id", putFormation);

  return router;
};
