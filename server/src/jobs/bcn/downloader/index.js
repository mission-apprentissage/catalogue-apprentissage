const path = require("path");
const logger = require("../../../common/logger");
const { downloadFile } = require("../../../common/utils/fileUtils");
const { runScript } = require("../../scriptWrapper");

const buildUrl = (table) => {
  return `https://bcn.depp.education.fr/bcn/index.php/export/CSV?n=${table}&idQuery=&actionBase=http%3A%2F%2Finfocentre.pleiade.education.fr%2Fbcn%2Findex.php%2Fexport%2FCSV&separator=%3B`;
};

const downloadBcnTable = async (table) => {
  const toFile = path.resolve(__dirname, `../assets/${table.toLowerCase()}.csv`);
  try {
    await downloadFile(buildUrl(table), toFile);

    logger.info(`download ${table} Succeed`);
  } catch (error) {
    logger.error(`download ${table} failed ${error}`);
  }
};

const downloadBcnTables = async () => {
  logger.info(`[BCN tables] Downloading`);
  await downloadBcnTable("N_FORMATION_DIPLOME");
  await downloadBcnTable("V_FORMATION_DIPLOME");
  await downloadBcnTable("N_NIVEAU_FORMATION_DIPLOME");
  await downloadBcnTable("N_MEF");
  await downloadBcnTable("N_LETTRE_SPECIALITE");
  await downloadBcnTable("N_DISPOSITIF_FORMATION");
  logger.info(`[BCN tables] Download completed`);
};

module.exports.downloadBcnTables = downloadBcnTables;

if (process.env.standalone) {
  runScript(async () => {
    await downloadBcnTables();
  });
}
