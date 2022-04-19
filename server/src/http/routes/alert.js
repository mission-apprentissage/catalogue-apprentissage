const express = require("express");
const { Alert } = require("../../common/model/index");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const mongoSanitize = require("express-mongo-sanitize");

module.exports = () => {
  const router = express.Router();

  router.get("/alert", async (req, res) => {
    const result = await Alert.find({});
    return res.json(result);
  });

  router.post(
    "/alert",
    tryCatch(async ({ body }, res) => {
      const { msg, name, type, enabled } = body;

      if (!msg || !name || !type || enabled === undefined) {
        return res.status(400).send({ error: "Erreur avec le message ou avec le nom ou le type ou enabled" });
      }

      const newAlert = new Alert({
        type,
        name,
        msg,
        enabled,
        time: new Date(),
      });

      newAlert.save();

      return res.json(newAlert);
    })
  );

  router.put(
    "/alert/:id",
    tryCatch(async ({ body, params }, res) => {
      const { msg, name, type } = body;

      if (!msg || !name || !type) {
        return res.status(400).send({ error: "Erreur avec le message ou avec le nom ou le type" });
      }

      const payload = mongoSanitize.sanitize(body);
      const result = await Alert.findOneAndUpdate({ _id: params.id }, payload, {
        new: true,
      });

      return res.json(result);
    })
  );

  router.patch(
    "/alert/:id",
    tryCatch(async ({ body, params }, res) => {
      const payload = mongoSanitize.sanitize(body);
      const result = await Alert.findOneAndUpdate({ _id: params.id }, payload, {
        new: false,
      });

      return res.json(result);
    })
  );

  router.delete(
    "/alert/:id",
    tryCatch(async (req, res) => {
      const result = await Alert.deleteOne({ type: "manuel", _id: req.params.id });
      return res.json(result);
    })
  );

  return router;
};
