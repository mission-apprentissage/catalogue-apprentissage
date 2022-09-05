const logger = require("../../../common/logger");
const importer = require("./importer/importer");
const { runScript } = require("../../scriptWrapper");

const rcoImporter = async (importDay = "") => {
  try {
    logger.info(" -- Start of RCO importer -- ");

    const uuidReport = await importer.run(importDay);

    logger.info(" -- End of RCO importer -- ");
    return uuidReport;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

module.exports = { rcoImporter };

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const importDay = args.find((arg) => arg.startsWith("--importDay"))?.split("=")?.[1];
    const uuidReport = await rcoImporter(importDay);
    console.log("uuidReport: ", uuidReport);
    console.log(`exemple next step standalone: yarn rco:converter --uuidReport=${uuidReport}`);
  });
}
