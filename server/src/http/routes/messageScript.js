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
    tryCatch(async ({ body }, res) => {
      const { msg, name, type } = body;

      if (!msg || !name || !type) {
        return res.status(400).send({ error: "Erreur avec le message ou avec le nom ou le type" });
      }

      const newMessageScript = new MessageScript({
        type,
        name,
        msg,
        enabled: true,
        time: new Date(),
      });

      newMessageScript.save();

      return res.json(newMessageScript);
    })
  );

  router.put(
    "/messageScript/:id",
    tryCatch(async ({ body, params }, res) => {
      const { msg, name, type } = body;
      const itemId = params.id;

      if (!msg || !name || !type) {
        return res.status(400).send({ error: "Erreur avec le message ou avec le nom ou le type" });
      }

      const result = await MessageScript.findOneAndUpdate({ _id: itemId }, body, {
        new: true,
      });

      return res.json(result);
    })
  );

  router.delete(
    "/messageScript",
    tryCatch(async (req, res) => {
      const result = await MessageScript.deleteOne({ type: "manuel" });
      return res.json(result);
    })
  );

  return router;
};
