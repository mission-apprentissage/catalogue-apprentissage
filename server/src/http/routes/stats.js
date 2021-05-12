const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { getAllStats } = require("../../common/components/stats");
const { Statistique } = require("../../common/model");

module.exports = () => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const stats = await getAllStats();
    return res.json(stats);
  });

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
