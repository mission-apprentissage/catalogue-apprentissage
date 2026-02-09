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
   *       Vous devez posséder des credentials. Veuillez contacter catalogue-apprentissage@education.gouv.fr pour en obtenir.<br /><br />
   *
   *       Pour les développeurs : l'API retourne un cookie de session "connect.sid" dans un header "Set-cookie", qui sera à retourner avec chaque requête subsidiaire sous la forme d'un header "Cookie: connect.sid=...".
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
   */
  router.post(
    "/login",
    tryCatch(async (req, res) => {
      const { username, password } = req.body;
      const user = await users.authenticate(username.trim(), password);

      if (!user)
        return res.status(401).json({
          message: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim().toLowerCase())
            ? "Email ou mot de passe incorrect, veuillez vérifier votre saisie. Vous pouvez essayer en saisissant l’email de la région académique (par ex. thomas.dupont@region-academique-hauts-de-france.fr). Si nécessaire signalez un mot de passe oublié. En cas de difficulté, contactez l’équipe support : catalogue-apprentissage@education.gouv.fr"
            : "Identifiant inconnu ou mot de passe incorrect, veuillez vérifier votre saisie. Vous pouvez utiliser votre adresse courriel en tant qu’identifiant. Si nécessaire signalez un mot de passe oublié. En cas de difficulté, contactez l’équipe support : catalogue-apprentissage@education.gouv.fr",
        });

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
    tryCatch(async (req, res, next) => {
      req.logOut(async (err) => {
        if (err) {
          return next(err);
        }
        req.session.destroy();
        const payload = await users.structureUser({ username: "anonymous", roles: ["public"], acl: [] });
        return res.json(payload);
      });
    })
  );

  return router;
};
