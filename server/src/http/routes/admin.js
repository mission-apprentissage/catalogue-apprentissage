const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const config = require("config");
const path = require("path");
const { Role } = require("../../common/model");

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  options: Joi.object({
    email: Joi.string().required(),
    academie: Joi.string().required(),
    roles: Joi.array().required(),
    permissions: Joi.object({
      isAdmin: Joi.boolean().required(),
    }).unknown(),
  }).unknown(),
});

const roleSchema = Joi.object({
  name: Joi.string().required(),
  acl: Joi.array().required(),
});

const getEmailTemplate = (type = "forgotten-password") => {
  return path.join(__dirname, `../../assets/templates/${type}.mjml.ejs`);
};

module.exports = ({ users, mailer }) => {
  const router = express.Router();

  router.get(
    "/",
    tryCatch(async (req, res) => {
      return res.json({
        message: "Authentified admin route",
      });
    })
  );

  router.get(
    "/users",
    tryCatch(async (req, res) => {
      const usersList = await users.getUsers();
      return res.json(usersList);
    })
  );

  router.post(
    "/user",
    tryCatch(async ({ body }, res) => {
      await userSchema.validateAsync(body, { abortEarly: false });

      const { username, password, options } = body;
      const user = await users.createUser(username, password, options);

      await mailer.sendEmail(
        user.email,
        `[${config.env} Catalogue apprentissage] Bienvenue`,
        getEmailTemplate("grettings"),
        {
          username,
          tmpPwd: password,
          publicUrl: config.publicUrl,
        }
      );

      return res.json(user);
    })
  );

  router.put(
    "/user/:username",
    tryCatch(async ({ body, params }, res) => {
      const username = params.username;

      await users.updateUser(username, {
        isAdmin: body.options.permissions.isAdmin,
        email: body.options.email,
        academie: body.options.academie,
        username: body.username,
        roles: body.options.roles,
      });

      res.json({ message: `User ${username} updated !` });
    })
  );

  router.delete(
    "/user/:username",
    tryCatch(async ({ params }, res) => {
      const username = params.username;

      await users.removeUser(username);

      res.json({ message: `User ${username} deleted !` });
    })
  );

  router.get(
    "/roles",
    tryCatch(async (req, res) => {
      const rolesList = await Role.find({}).lean();
      return res.json(rolesList);
    })
  );

  router.post(
    "/role",
    tryCatch(async ({ body }, res) => {
      await roleSchema.validateAsync(body, { abortEarly: false });

      const { name, acl } = body;

      const role = new Role({
        name,
        acl,
      });

      await role.save();

      return res.json(role.toObject());
    })
  );

  router.put(
    "/role/:name",
    tryCatch(async ({ body, params }, res) => {
      const name = params.name;

      let role = await Role.findOne({ name });
      if (!role) {
        throw new Error(`Unable to find Rôle ${role}`);
      }

      await Role.findOneAndUpdate(
        { _id: role._id },
        {
          acl: body.acl,
        },
        { new: true }
      );

      res.json({ message: `Rôle ${name} updated !` });
    })
  );

  router.delete(
    "/role/:name",
    tryCatch(async ({ params }, res) => {
      const name = params.name;

      let role = await Role.findOne({ name });
      if (!role) {
        throw new Error(`Unable to find Rôle ${role}`);
      }

      await role.deleteOne({ name });

      res.json({ message: `Rôle ${name} deleted !` });
    })
  );

  return router;
};
