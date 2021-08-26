const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");

module.exports = ({ catalogue }) => {
  const router = express.Router();

  router.post(
    "/etablissement",
    tryCatch(async (req, res) => {
      const { query } = req.body;
      if (!query) {
        return res.status(400).send({ error: "Missing query" });
      }

      let etablissement = await catalogue.getEtablissement(query);
      let newEtablissement = false;
      if (etablissement.message === "Etablissement doesn't exist") {
        //TODO once we create etablissement = await catalogue.createEtablissement({ uai, siret });
        newEtablissement = true;
      }
      return res.json({ ...etablissement, new: newEtablissement });
    })
  );

  return router;
};
