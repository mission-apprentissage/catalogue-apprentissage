const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  options: Joi.object({
    email: Joi.string().required(),
    academie: Joi.string().required(),
    permissions: Joi.object({
      isAdmin: Joi.boolean().required(),
    }).unknown(),
  }).unknown(),
});

module.exports = ({ users }) => {
  const router = express.Router();

  router.get(
    "/",
    tryCatch(async (req, res) => {
      return res.json({
        message: "Authentified admin route",
      });
    })
  );

  router.post(
    "/create-user",
    tryCatch(async ({ body }, res) => {
      await userSchema.validateAsync(body, { abortEarly: false });

      const { username, password, options } = body;
      const user = await users.createUser(username, password, options);

      return res.json(user);
    })
  );

  return router;
};
