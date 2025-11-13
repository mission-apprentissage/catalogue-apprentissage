const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const config = require("config");
const path = require("path");
const Boom = require("boom");
const { User } = require("../../common/models");
const { sanitize, SAFE_FIND_OPERATORS } = require("../../common/utils/sanitizeUtils");

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

const getEmailTemplate = (type = "forgotten-password") => {
  return path.join(__dirname, `../../assets/templates/${type}.mjml.ejs`);
};

const closeSessionsOfThisUser = async (db, username) =>
  new Promise((resolve, reject) => {
    db.collection("sessions", function (err, collection) {
      collection.find({}).toArray(function (err, data) {
        const sessionIdToDelete = [];
        for (let index = 0; index < data.length; index++) {
          const element = data[index];
          const session = JSON.parse(element.session);
          if (session.passport.user.sub === username) {
            sessionIdToDelete.push(element._id);
          }
        }
        collection.deleteMany({ _id: { $in: sessionIdToDelete } }, function (err, r) {
          if (err) {
            return reject(err);
          }
          resolve(r);
        });
      });
    });
  });

module.exports = ({ users, mailer, db: { db } }) => {
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
      await userSchema.validateAsync(req.body, { abortEarly: false });

      const { username, password, options } = req.body;

      let alreadyExists = await users.getUser(username);
      if (alreadyExists) {
        throw Boom.conflict(`Impossible de créer, l'utilisateur ${username.toLowerCase()} existe déjà.`);
      }
      alreadyExists = await users.getUserByEmail(options.email);
      if (alreadyExists) {
        throw Boom.conflict(`Impossible de créer, l'email ${options.email.toLowerCase()} est déjà utilisé.`);
      }

      const user = await users.createUser(username, password, { ...options, created_by: req.user.email });

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
    tryCatch(async (req, res) => {
      const username = req.params.username;

      await users.updateUser(username, {
        isAdmin: req.body.options.permissions.isAdmin,
        email: req.body.options.email?.toLowerCase(),
        academie: req.body.options.academie,
        username: req.body.username?.toLowerCase(),
        tag: req.body.options.tag,
        fonction: req.body.options.fonction,
        roles: req.body.options.roles,
        acl: req.body.options.acl,
        updated_by: req.user.email,
      });

      await closeSessionsOfThisUser(db, username);

      res.json({ message: `Utilisateur ${username} mis à jour !` });
    })
  );

  router.delete(
    "/user/:username",
    tryCatch(async ({ params }, res) => {
      const username = params.username;

      await users.removeUser(username);

      await closeSessionsOfThisUser(db, username);

      res.json({ message: `Utilisateur ${username} supprimé !` });
    })
  );

  router.post(
    "/user/:username/tags",
    tryCatch(async (req, res) => {
      const username = req.params.username;

      await users.addTag(username, req.body.tag);

      res.json({ message: `Utilisateur ${username} mis à jour !` });
    })
  );

  router.delete(
    "/user/:username/tags",
    tryCatch(async (req, res) => {
      const username = req.params.username;

      await users.removeTag(username, req.body.tag);

      res.json({ message: `Utilisateur ${username} mis à jour !` });
    })
  );

  return router;
};
