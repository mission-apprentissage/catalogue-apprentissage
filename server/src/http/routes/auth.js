const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 calls per minute
  message: "Too many calls from this IP, please try again after one minute",
});

module.exports = ({ users }) => {
  const router = express.Router(); // eslint-disable-line new-cap

  /**
   * @swagger
   *
   * /auth:
   *   post:
   *     summary: Authentification
   *     tags:
   *       - Authentification
   *     description: >
   *       Cette api vous permet d'authentifier l'utilisateur<br/><br />
   *       Vous devez posséder des credentials. Veuillez contacter catalogue@apprentissage.beta.gouv.fr pour en obtenir<br /><br />
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
   *                  user:
   *                    type: object
   */
  router.post(
    "/login",
    authLimiter,
    tryCatch(async (req, res) => {
      const { username, password } = req.body;
      const user = await users.authenticate(username, password);

      if (!user) return res.status(401).json({ message: "Utilisateur non trouvé" });

      const payload = await users.structureUser(user);

      req.logIn(payload, async () => {
        await users.registerUser(payload.email);
        return res.json(payload);
      });
    })
  );

  router.get(
    "/logout",
    tryCatch(async (req, res) => {
      req.logOut();
      req.session.destroy();
      const payload = await users.structureUser({ username: "anonymous", roles: ["public"], acl: [] });
      return res.json(payload);
    })
  );

  router.get(
    "/current-session",
    tryCatch(async (req, res) => {
      if (req.user) {
        let { user } = req.session.passport;
        return res.json(user);
      }
      const payload = await users.structureUser({ username: "anonymous", roles: ["public"], acl: [] });
      return res.json(payload);
    })
  );

  return router;
};
