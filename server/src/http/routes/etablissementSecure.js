const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const { Etablissement } = require("../../common/model");
const logger = require("../../common/logger");
const Boom = require("boom");
const { sanitize } = require("../../common/utils/sanitizeUtils");

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
      const payload = sanitize(body);
      await etablissementSchema.validateAsync(payload, { abortEarly: false });

      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",").map((academieStr) => Number(academieStr));
        hasRightToEdit = listAcademie.includes(-1) || listAcademie.includes(Number(payload.num_academie));
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      const exist = await Etablissement.findOne({
        siret: payload.siret,
      });
      if (exist) {
        throw Boom.conflict("L'etablissement existe déjà");
      }

      logger.info("Adding new etablissement: ", payload);

      const etablissement = new Etablissement({
        ...payload,
        ...(payload.uai ? { uai: payload.uai.trim(), uai_valide: true } : {}),
      });
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
      const payload = sanitize(body);
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

      logger.info("Updating new item: ", payload);

      const result = await Etablissement.findOneAndUpdate(
        { _id: itemId },
        {
          ...payload,
          ...(payload.uai ? { uai: payload.uai.trim(), uai_valide: true } : {}),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.json(result);
    })
  );

  return router;
};
