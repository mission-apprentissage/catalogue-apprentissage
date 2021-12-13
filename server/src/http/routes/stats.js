const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Statistique } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  /**
   * Route utilisée par LBA pour mesurer le nombre de formations du catalogue vues sur LBA
   */
  router.post(
    "/",
    tryCatch(async (req, res) => {
      const { source, id_rco_formation, cle_ministere_educatif } = req.body;

      if (!source || !(id_rco_formation || cle_ministere_educatif)) {
        return res.status(400).json({ error: "source and (id_rco_formation or cle_ministere_educatif) are mandatory" });
      }

      const payload = {
        source,
        id_rco_formation,
        cle_ministere_educatif,
        date: new Date(),
      };

      await Statistique.create(payload);

      return res.sendStatus(200);
    })
  );

  return router;
};
