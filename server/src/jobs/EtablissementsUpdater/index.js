const logger = require("../../common/logger");
const updater = require("./updater/updater");
const commandLineArgs = require("command-line-args");

const { runScript } = require("../scriptWrapper");

const optionDefinitions = [
  { name: "filter", alias: "f", type: String, defaultValue: "{}" },
  { name: "withHistoryUpdate", alias: "h", type: Boolean, defaultValue: true },
  { name: "siret", alias: "s", type: Boolean, defaultValue: false },
  { name: "geoloc", alias: "g", type: Boolean, defaultValue: false },
  { name: "conventionnement", alias: "c", type: Boolean, defaultValue: false },
  { name: "onisep", alias: "o", type: Boolean, defaultValue: false },
];
// Usage
// Only conventionnment -c
// Only siret -s
// Only location and geoloc -lg
const EtablissementsUpdater = async () => {
  try {
    logger.info(" -- Start of etablissements updater -- ");

    const optionsCmd = commandLineArgs(optionDefinitions);

    const all = !optionsCmd.siret && !optionsCmd.geoloc && !optionsCmd.conventionnement && !optionsCmd.onisep;

    const filter = JSON.parse(optionsCmd.filter);

    let options = {
      withHistoryUpdate: optionsCmd.withHistoryUpdate,
      scope: all
        ? {
            siret: true,
            geoloc: true,
            conventionnement: true,
            onisep: true,
          }
        : {
            siret: optionsCmd.siret,
            geoloc: optionsCmd.geoloc,
            conventionnement: optionsCmd.conventionnement,
            onisep: optionsCmd.onisep,
          },
    };
    await updater.run(filter, options);

    logger.info(" -- End of etablissements updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.EtablissementsUpdater = EtablissementsUpdater;

if (process.env.run) {
  runScript(async () => {
    await EtablissementsUpdater();
  });
}
