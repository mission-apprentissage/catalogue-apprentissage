const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Statistique } = require("../../common/models");
const { sanitize } = require("../../common/utils/sanitizeUtils");

module.exports = () => {
  const router = express.Router();

  /**
   * Route utilisée par LBA pour mesurer le nombre de formations du catalogue vues sur LBA
   */
  router.post(
    "/",
    tryCatch(async (req, res) => {
      const payload = sanitize(req.body);

      const { source } = payload;

      if (!source) {
        return res.status(400).json({ error: "source is mandatory" });
      }

      await Statistique.findOneAndUpdate({ source }, { $inc: { count: 1 } }, { upsert: true });

      return res.sendStatus(200);
    })
  );

  return router;
};
