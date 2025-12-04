const express = require("express");
const { compose, transformIntoJSON } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Formation } = require("../../common/models");
const { sendJsonStream } = require("../../common/utils/httpUtils");

module.exports = () => {
  const router = express.Router();

  /**
   * Route spéciale pour futurepro (ex "c'est qui le pro")
   * Retourne la liste des cle_ministere_educatif et des uai_formation associées sur le périmètre Affelnet
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      const stream = compose(
        Formation.find(
          { published: true, affelnet_perimetre: true },
          {
            _id: 0,
            cle_ministere_educatif: 1,
            uai_formation: 1,
          }
        )
          .limit(0)
          .cursor(),
        transformIntoJSON()
      );

      return sendJsonStream(stream, res);
    })
  );

  return router;
};
