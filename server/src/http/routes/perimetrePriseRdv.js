const express = require("express");
const { compose, transformIntoJSON } = require("oleoduc");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { Formation } = require("../../common/model");
const { sendJsonStream } = require("../../common/utils/httpUtils");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/",
    tryCatch(async (req, res) => {
      const stream = compose(
        Formation.find(
          { $or: [{ affelnet_perimetre_prise_rdv: true }, { parcoursup_perimetre_prise_rdv: true }] },
          { _id: 0, cle_ministere_educatif: 1, affelnet_perimetre_prise_rdv: 1, parcoursup_perimetre_prise_rdv: 1 }
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
