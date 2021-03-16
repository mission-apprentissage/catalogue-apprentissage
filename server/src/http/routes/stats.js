const express = require("express");
const { getAllStats } = require("../../common/components/stats");

module.exports = () => {
  const router = express.Router();
  router.get("/", async (req, res) => {
    const stats = await getAllStats();
    res.json(stats);
  });

  return router;
};
