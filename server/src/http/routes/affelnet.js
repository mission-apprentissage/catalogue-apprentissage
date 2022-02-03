const { AfReconciliation } = require("../../common/model");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const express = require("express");

module.exports = () => {
  const router = express.Router();

  router.put(
    "/reconciliation",
    tryCatch(async (req, res) => {
      const { uai_formation, uai_gestionnaire, uai_formateur, cfd, email = null } = req.body;
      const uais = [uai_formation, uai_gestionnaire, uai_formateur].filter((uai) => uai);

      if (uais.length === 0 || !cfd) {
        res.status(400).json({ message: "Un uai ou le cfd est manquant" });
      }

      try {
        await AfReconciliation.findOneAndUpdate({ uai: { $in: uais }, code_cfd: cfd }, { unpublished_by_user: email });
        return res.sendStatus(200);
      } catch (error) {
        return res.status(400).json(error);
      }
    })
  );

  return router;
};
