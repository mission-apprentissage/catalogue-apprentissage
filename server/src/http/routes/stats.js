const express = require("express");
const { ConvertedFormation } = require("../../common/model");

module.exports = () => {
  const router = express.Router();
  router.get("/", async (req, res) => {
    res.json({
      stats: {
        nbItems: await ConvertedFormation.countDocuments(),
      },
    });
  });

  return router;
};
