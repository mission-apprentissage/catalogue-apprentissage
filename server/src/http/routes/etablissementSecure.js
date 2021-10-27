const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const { Etablissement } = require("../../common/model");
const logger = require("../../common/logger");
const Boom = require("boom");

/**
 * Schema for validation
 */
const etablissementSchema = Joi.object({
  num_academie: Joi.number().required(),
}).unknown();

/**
 * Sample entity route module for POST / PUT / DELETE entity
 */
module.exports = () => {
  const router = express.Router();

  /**
   * Add/Post an item validated by schema createEtablissement /etablissement POST
   */
  router.post(
    "/etablissement",
    tryCatch(async ({ body, user }, res) => {
      await etablissementSchema.validateAsync(body, { abortEarly: false });

      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
        hasRightToEdit = listAcademie.includes(-1) || listAcademie.includes(Number(body.num_academie));
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      const exist = await Etablissement.findOne({
        siret: body.siret,
      });
      if (exist) {
        throw Boom.conflict("L'etablissement existe déjà");
      }

      logger.info("Adding new etablissement: ", body);

      const etablissement = new Etablissement(body);
      await etablissement.save();

      // return new etablissement
      res.json(etablissement);
    })
  );

  /**
   * Update an item validated by schema updateEtablissement etablissement/{id} PUT
   */
  router.put(
    "/etablissement/:id",
    tryCatch(async ({ body, user, params }, res) => {
      const itemId = params.id;

      const etablissement = await Etablissement.findById(itemId);
      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
        hasRightToEdit = listAcademie.includes(-1) || listAcademie.includes(Number(etablissement.num_academie));
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      logger.info("Updating new item: ", body);
      const result = await Etablissement.findOneAndUpdate({ _id: itemId }, body, { new: true });
      res.json(result);
    })
  );

  /**
   * Delete an item by id deleteEtablissement etablissement/{id} DELETE
   */
  router.delete(
    "/etablissement/:id",
    tryCatch(async ({ user, params }, res) => {
      const itemId = params.id;

      const etablissement = await Etablissement.findById(itemId);
      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
        hasRightToEdit = listAcademie.includes(-1) || listAcademie.includes(Number(etablissement.num_academie));
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      await Etablissement.deleteOne({ id: itemId });
      res.json({ message: `Etablissement ${itemId} deleted !` });
    })
  );

  return router;
};
