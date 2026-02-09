const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const config = require("config");
const path = require("path");
const Boom = require("boom");
const { User } = require("../../common/models");
const { sanitize, SAFE_FIND_OPERATORS } = require("../../common/utils/sanitizeUtils");
const { generate } = require("generate-password");
const logger = require("../../common/logger");
const { isUserAdmin } = require("../../common/utils/rolesUtils");

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  options: Joi.object({
    email: Joi.string().required(),
    academie: Joi.string().required(),
    roles: Joi.array().required(),
    permissions: Joi.object({
      isAdmin: Joi.boolean(),
    }).unknown(),
  }).unknown(),
});

const getEmailTemplate = (type = "forgotten-password") => {
  return path.join(__dirname, `../../assets/templates/${type}.mjml.ejs`);
};

const closeSessionsOfThisUser = async (db, username) => {
  const sessionIdToDelete = [];

  for await (const { _id, session } of db.collection("sessions").find()) {
    const value = JSON.parse(session);

    if (value.passport.user.sub === username) {
      sessionIdToDelete.push(_id);
    }
  }

  console.log({ sessionIdToDelete });

  await db.collection("sessions").deleteMany({ _id: { $in: sessionIdToDelete } });
};

module.exports = ({ users, mailer, db }) => {
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

  /**
   * Get count users/count GET
   */
  router.get(
    "/users/count",
    tryCatch(async (req, res) => {
      const qs = req.query;
      let query = qs && qs.query ? JSON.parse(qs.query) : {};
      query = sanitize(query, SAFE_FIND_OPERATORS);

      const retrievedData = await User.countDocuments(query);
      if (retrievedData) {
        res.json(retrievedData);
      } else {
        res.json({ message: `Item doesn't exist` });
      }
    })
  );

  router.post(
    "/user",
    tryCatch(async (req, res) => {
      const auth = req.session?.passport?.user;

      await userSchema.validateAsync(req.body, { abortEarly: false });

      const { username, password, options } = req.body;

      let existingUser = await users.getUser(username);

      if (existingUser) {
        throw Boom.conflict(`Impossible de créer, l'utilisateur ${username.toLowerCase()} existe déjà.`);
      }
      existingUser = await users.getUserByEmail(options.email);
      if (existingUser) {
        throw Boom.conflict(`Impossible de créer, l'email ${options.email.toLowerCase()} est déjà utilisé.`);
      }

      if (typeof req.body.options.permissions.isAdmin !== "undefined" && !isUserAdmin(auth)) {
        throw Boom.forbidden("Seul un administrateur peut attribuer le rôle d'administrateur.");
      }

      const user = await users.createUser(username, password, { ...options, created_by: auth?.email });

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

      res.json({ message: `Utilisateur ${username} créé !`, user });
    })
  );

  router.put(
    "/user/:username",
    tryCatch(async (req, res) => {
      const username = req.params.username;

      const existingUser = await users.getUser(username);

      if (!existingUser) {
        throw Boom.notFound("L'utilisateur demandé n'existe pas");
      }

      if (existingUser.isAdmin && !isUserAdmin(req.user)) {
        throw Boom.forbidden("Seul un administrateur peut modifier un autre administrateur.");
      }

      if (typeof req.body.options.permissions.isAdmin !== "undefined" && !isUserAdmin(req.user)) {
        throw Boom.forbidden("Seul un administrateur peut attribuer/supprimer le rôle d'administrateur.");
      }

      const user = await users.updateUser(username, {
        isAdmin: req.body.options.permissions.isAdmin,
        email: req.body.options.email?.toLowerCase(),
        academie: req.body.options.academie,
        username: req.body.username?.toLowerCase(),
        tag_1: req.body.options.tag_1,
        tag_2: req.body.options.tag_2,
        fonction: req.body.options.fonction,
        roles: req.body.options.roles,
        acl: req.body.options.acl,
        updated_by: req.session?.passport?.user?.email,
      });

      await closeSessionsOfThisUser(db, username);

      res.json({ message: `Utilisateur ${username} mis à jour !`, user });
    })
  );

  router.patch(
    "/user/:username/regenerate-password",
    tryCatch(async (req, res) => {
      const username = req.params.username;

      const existingUser = await users.getUser(username);

      if (!existingUser) {
        throw Boom.notFound("L'utilisateur demandé n'existe pas");
      }

      if (existingUser.isAdmin && !isUserAdmin(req.user)) {
        throw Boom.forbidden("Seul un administrateur peut modifier un autre administrateur");
      }

      const password = generate({
        length: 12,
        numbers: true,
      });

      await closeSessionsOfThisUser(db, username);

      const user = await users.changePassword(username, password, { forceReset: true });

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

      // logger.info(`New temp password for ${username} : ${password}`);

      res.json({ message: `Utilisateur ${username} mis à jour !`, user });
    })
  );

  router.delete(
    "/user/:username",
    tryCatch(async ({ params }, res) => {
      const username = params.username;

      const existingUser = await users.getUser(username);

      if (!existingUser) {
        throw Boom.notFound("L'utilisateur demandé n'existe pas");
      }

      if (existingUser.isAdmin && !isUserAdmin(req.user)) {
        throw Boom.forbidden("Seul un administrateur peut supprimer un autre administrateur");
      }

      await closeSessionsOfThisUser(db, username);

      await users.removeUser(username);

      res.json({ message: `Utilisateur ${username} supprimé !` });
    })
  );

  // router.post(
  //   "/user/:username/tags",
  //   tryCatch(async (req, res) => {
  //     const username = req.params.username;

  //     await users.addTag(username, req.body.tag);

  //     res.json({ message: `Utilisateur ${username} mis à jour !` });
  //   })
  // );

  // router.delete(
  //   "/user/:username/tags",
  //   tryCatch(async (req, res) => {
  //     const username = req.params.username;

  //     await users.removeTag(username, req.body.tag);

  //     res.json({ message: `Utilisateur ${username} mis à jour !` });
  //   })
  // );

  return router;
};
