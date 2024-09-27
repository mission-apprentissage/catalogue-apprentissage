const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const { getCampagneStartDate, getSessionStartDate, getSessionEndDate } = require("../../common/utils/rulesUtils");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  router.get(
    "/dates",
    tryCatch(async (req, res) => {
      return res.json({
        campagneStartDate: await getCampagneStartDate(),
        sessionStartDate: await getSessionStartDate(),
        sessionEndDate: await getSessionEndDate(),
      });
    })
  );

  return router;
};
