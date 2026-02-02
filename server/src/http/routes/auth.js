const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");

module.exports = ({ users }) => {
  const router = express.Router(); // eslint-disable-line new-cap

  /**
   * @swagger
   *
   * /auth/current-session:
   *   get:
   *     summary: Session courante
   *     tags:
   *       - Authentification
   *     description: >
   *       Cette api vous permet de récupérer la session actuelle.<br/><br />
   *       La session actuelle peut être liée à un utilisateur existant, ou être anonyme.<br /><br />
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/session'
   */
  router.get(
    "/current-session",
    tryCatch(async (req, res) => {
      if (req.user) {
        const user = req.session.passport.user;
        return res.json(user);
      }
      const payload = await users.structureUser({ username: "anonymous", roles: ["public"], acl: [] });
      return res.json(payload);
    })
  );

  return router;
};
