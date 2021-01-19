const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { createUserToken } = require("../../common/utils/jwtUtils");
const compose = require("compose-middleware").compose;
const tryCatch = require("../middlewares/tryCatchMiddleware");

module.exports = ({ users }) => {
  const router = express.Router(); // eslint-disable-line new-cap
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      function (username, password, cb) {
        return users
          .authenticate(username, password)
          .then((user) => {
            if (!user) {
              return cb(null, false);
            }
            return cb(null, user);
          })
          .catch((err) => cb(err));
      }
    )
  );
  /**
   * @swagger
   *
   * /login:
   *   post:
   *     summary: Récuparation du token d'authentification
   *     tags:
   *       - Authentification
   *     description: >
   *       Cette api vous permet de récupérer un token d'authentification.<br/><br />
   *       Vous devez posséder des credentials. Veuillez contacter catalogue@apprentissage.beta.gouv.fr pour en obtenir<br /><br />
   *       Pour accéder aux routes sécurisé, ```Authorization: Bearer MONTOKEN```
   *     requestBody:
   *       description: L'objet JSON **doit** contenir les clés **username** et **password**.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: "foo"
   *               password:
   *                 type: string
   *                 example: "bar"
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  token:
   *                    type: string
   */
  router.post(
    "/",
    compose([
      passport.authenticate("local", { session: false, failWithError: true }),
      tryCatch(async (req, res) => {
        const user = req.user;
        const token = createUserToken(user);
        return res.json({ token });
      }),
    ])
  );

  return router;
};
