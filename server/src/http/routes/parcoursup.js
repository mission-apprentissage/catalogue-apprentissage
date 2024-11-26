const { Formation } = require("../../common/models");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const express = require("express");
const Boom = require("boom");
const { createFormation } = require("../../jobs/parcoursup/export");
const { PARCOURSUP_STATUS } = require("../../constants/status");
const { sanitize } = require("../../common/utils/sanitizeUtils");

module.exports = () => {
  const router = express.Router();

  /**
   * Send formation to the Parcoursup web service
   */
  router.post(
    "/send-ws",
    tryCatch(async (req, res) => {
      const payload = sanitize(req.body);

      let user = {};
      if (req.user) {
        user = req.session?.passport?.user;
      }

      const { id } = payload;
      const formation = await Formation.findById(id);

      if (!formation) {
        throw Boom.notFound();
      }

      if (!formation.parcoursup_statut === PARCOURSUP_STATUS.PRET_POUR_INTEGRATION) {
        throw Boom.forbidden('La formation n\'est pas "prêt pour intégration"');
      }

      const formationUpdated = await createFormation(formation, user.email);
      if (formationUpdated.parcoursup_error) {
        return res.status(500).json({ message: formationUpdated.parcoursup_error });
      }
      return res.status(200).json({ message: "La formation a été envoyé avec succès au webservice Parcoursup" });
    })
  );

  return router;
};
