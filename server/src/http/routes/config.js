const express = require("express");
const { Config } = require("../../common/models");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { sanitize } = require("../../common/utils/sanitizeUtils");
const { isUserAdmin } = require("../../common/utils/rolesUtils");
const Boom = require("boom");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/config",
    tryCatch(async (req, res) => {
      if (!(await Config.countDocuments())) {
        await new Config({}).save();
      }

      const config = await Config.findOne({}, { _id: 0, __v: 0 }).lean();

      return res.json(config);
    })
  );

  router.put(
    "/admin/config",
    tryCatch(async (req, res) => {
      const auth = req.session?.passport?.user;

      if (!isUserAdmin(auth)) {
        throw Boom.unauthorized("Seul un administrateur peut modifier la configuration de l'application");
      }

      const payload = sanitize(req.body);

      const result = await Config.findOneAndUpdate({}, payload, {
        new: true,
      });

      return res.json(result);
    })
  );

  router.patch(
    "/admin/config",
    tryCatch(async (req, res) => {
      const auth = req.session?.passport?.user;

      if (!isUserAdmin(auth)) {
        throw Boom.unauthorized("Seul un administrateur peut modifier la configuration de l'application");
      }

      const payload = sanitize(req.body);
      const result = await Config.findOneAndUpdate({}, payload, {
        new: false,
      });

      return res.json(result);
    })
  );

  return router;
};
