const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");

module.exports = ({ users }) => {
  const router = express.Router(); // eslint-disable-line new-cap

  /**
   * @swagger
   *
   * /auth/login:
   *   post:
   *     summary: Authentification
   *     tags:
   *       - Authentification
   *     description: >
   *       Cette api vous permet d'authentifier l'utilisateur.<br/><br />
   *       Vous devez posséder des credentials. Veuillez contacter catalogue@apprentissage.beta.gouv.fr pour en obtenir.<br /><br />
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
   *                $ref: '#/components/schemas/session'
   *         headers:
   *           Set-Cookie:
   *             schema:
   *               type: string
   *               example: connect.sid=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Path=/; HttpOnly; SameSite=Strict; Secure
   *       401:
   *         description: Unauthorized
   *         content:
   *            application/json:
   *              schema:
   *                type: object
   *                properties:
   *                  message:
   *                    type: string
   *                    example: "Utilisateur non trouvé"
   *
   */
  router.post(
    "/login",
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

  /**
   * @swagger
   *
   * /auth/logout:
   *   get:
   *     summary: Déconnexion
   *     tags:
   *       - Authentification
   *     description: >
   *       Cette api vous permet de déconnecter l'utilisateur.<br/><br />
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/session'
   */
  router.get(
    "/logout",
    tryCatch(async (req, res) => {
      req.logOut();
      req.session.destroy();
      const payload = await users.structureUser({ username: "anonymous", roles: ["public"], acl: [] });
      return res.json(payload);
    })
  );

  return router;
};
