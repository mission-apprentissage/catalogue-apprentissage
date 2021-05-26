const express = require("express");
const { MessageScript } = require("../../common/model/index");

module.exports = () => {
  const router = express.Router();

  router.get("/messageScript", async (req, res) => {
    const result = await MessageScript.find({});
    return res.json(result);
  });

  return router;
};
