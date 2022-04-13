const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
// const { Formation } = require("../../../common/model");
// const { paginator } = require("../../../common/utils/paginator");

/*
 * Apply rejected badge if formation publication is on error.
 */

runScript(async () => {
  logger.info(`Start rejection job`);

  // const query = { parcoursup_error: /400/ };

  // await paginator(
  //   Formation,
  //   {
  //     filter: query,
  //     limit: 10,
  //   },
  //   async (formation) => {
  //     formation.rejected_cause = formation.parcoursup_error
  //     formation.parcoursup_statut =
  //   }
  // );

  logger.info(`End find RCO duplicates`);
});
