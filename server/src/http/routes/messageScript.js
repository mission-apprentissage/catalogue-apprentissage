const express = require("express");
const { MessageScript } = require("../../common/model/index");
const tryCatch = require("../middlewares/tryCatchMiddleware");

module.exports = () => {
  const router = express.Router();

  router.get("/messageScript", async (req, res) => {
    const result = await MessageScript.find({});
    return res.json(result);
  });

  router.post(
    "/messageScript",
    tryCatch(async (req, res) => {
      const { msg, name } = req.body;

      const payload = {
        msg,
        name,
        time: new Date(),
      };

      await MessageScript.create(payload);
      return res.sendStatus(200);
    })
  );

  return router;
};
