const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Boom = require("boom");

module.exports = ({ catalogue }) => {
  const router = express.Router();

  router.put(
    "/etablissement/:id",
    tryCatch(async ({ body, user, params }, res) => {
      const itemId = params.id;

      let hasRightToEdit = user.isAdmin;
      if (!hasRightToEdit) {
        throw Boom.unauthorized();
      }

      const result = await catalogue.updateEtablissement(itemId, body);
      res.json(result);
    })
  );

  return router;
};
