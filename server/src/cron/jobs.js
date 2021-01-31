const importEtablissements = require("../jobs/etablissements");
const { runScript } = require("../jobs/scriptWrapper");
const logger = require("../common/logger");
const cron = require("node-cron");

cron.schedule(
  "0 2 * * *",
  () => {
    runScript(async ({ catalogue }) => {
      logger.info("Start etablissemnt import");

      await importEtablissements(catalogue);

      logger.info("End etablissemnt import");
    });
  },
  {
    timezone: "Europe/Paris",
  }
);
