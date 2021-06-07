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
      const msg = req.body.msg;
      const name = req.body.name;

      if (!msg || !name) {
        return res.status(400).send({ error: "Erreur avec le message ou avec le nom" });
      }

      const newMessageScript = new MessageScript({
        name,
        msg,
        time: new Date(),
      });

      newMessageScript.save();

      return res.json(newMessageScript);
    })
  );

  router.delete(
    "/messageScript",
    tryCatch(async (req, res) => {
      const result = await MessageScript.deleteOne({});
      return res.json(result);
    })
  );

  return router;
};
