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
      const { source, id_rco_formation } = req.body;

      if (!source || !id_rco_formation) {
        return res.status(400).json({ error: "source and id_rco_formation are mandatory" });
      }

      const payload = {
        source,
        id_rco_formation,
        date: new Date(),
      };

      await Statistique.create(payload);

      return res.sendStatus(200);
    })
  );

  return router;
};
