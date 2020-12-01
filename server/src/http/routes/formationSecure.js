const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const { MnaFormation } = require("../../common/model");
const logger = require("../../common/logger");
const Boom = require("boom");

/**
 * Schema for validation
 */
const formationSchema = Joi.object({
  num_academie: Joi.string().required(),
}).unknown();

/**
 * Sample entity route module for POST / PUT / DELETE entity
 */
module.exports = () => {
  const router = express.Router();

  /**
   * Add/Post an item validated by schema createTraining /formation POST
   */
  router.post(
    "/formation",
    tryCatch(async ({ body, user }, res) => {
      await formationSchema.validateAsync(body, { abortEarly: false });

      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",");
        hasRightToEdit = listAcademie.includes(`${body.num_academie}`);
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      // TODO BELOW CHECK IF ALREADY EXIST
      // const exist = await MnaFormation.findOne({
      //   cfd: body.cfd,
      //   code_postal: body.code_postal,
      //   uai_formation: body.uai_formation,
      // });
      // if (exist) {
      //   Boom.conflict("La formation existe déjà");
      // }

      const item = body;
      logger.info("Adding new formation: ", item);

      const formation = new MnaFormation(body);

      await formation.save();

      // return new formation
      res.json(formation);
    })
  );

  /**
   * Update an item validated by schema updateTraining formation/{id} PUT
   */
  router.put(
    "/formation/:id",
    tryCatch(async ({ body, user, params }, res) => {
      // await formationSchema.validateAsync(body, { abortEarly: false });

      const itemId = params.id;

      const formation = await MnaFormation.findById(itemId);
      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",");
        hasRightToEdit = listAcademie.includes(`${formation.num_academie}`);
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      logger.info("Updating new item: ", body);
      const result = await MnaFormation.findOneAndUpdate({ _id: itemId }, body, { new: true });
      res.json(result);
    })
  );

  /**
   * Delete an item by id deleteTraining formation/{id} DELETE
   */
  router.delete(
    "/formation/:id",
    tryCatch(async ({ user, params }, res) => {
      const itemId = params.id;

      const formation = await MnaFormation.findById(itemId);
      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        const listAcademie = user.academie.split(",");
        hasRightToEdit = listAcademie.includes(`${formation.num_academie}`);
      }
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      await MnaFormation.deleteOne({ id: itemId });
      res.json({ message: `Item ${itemId} deleted !` });
    })
  );

  return router;
};
