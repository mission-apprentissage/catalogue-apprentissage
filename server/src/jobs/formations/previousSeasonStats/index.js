// @ts-check
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { isSameDate } = require("../../../common/utils/dateUtils");
const { PreviousSeasonFormation, Formation } = require("../../../common/model");
const { PARCOURSUP_STATUS, AFFELNET_STATUS } = require("../../../constants/status");

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */

const inScopeAffelnetStatuses = [
  AFFELNET_STATUS.PUBLIE,
  AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  AFFELNET_STATUS.A_PUBLIER,
  AFFELNET_STATUS.EN_ATTENTE,
];

const inScopeParcoursupStatuses = [
  PARCOURSUP_STATUS.PUBLIE,
  PARCOURSUP_STATUS.A_PUBLIER,
  PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  PARCOURSUP_STATUS.EN_ATTENTE,
];

/**
 * @param {Formation} formation
 * @returns {"affelnet" | "parcoursup"}
 */
const getPlateforme = ({ affelnet_statut }) =>
  inScopeAffelnetStatuses.includes(affelnet_statut) ? "affelnet" : "parcoursup";

const storePreviousSeasonFormations = async () => {
  // empty previous stats collection
  await PreviousSeasonFormation.deleteMany({});

  // then store season formations
  const query = {
    published: true,
    catalogue_published: true,
    $or: [
      { affelnet_statut: { $in: inScopeAffelnetStatuses } },
      { parcoursup_statut: { $in: inScopeParcoursupStatuses } },
    ],
  };

  const select = { cle_ministere_educatif: 1, num_academie: 1, affelnet_statut: 1 };

  /**
   * @type {import("mongoose").QueryCursor<Formation>}
   */
  const cursor = Formation.find(query, select).lean().cursor();

  for await (const formation of cursor) {
    await PreviousSeasonFormation.create({
      ...formation,
      plateforme: getPlateforme(formation),
    });
  }
};

/**
 * @param {object} options
 * @param {number} [options.month=7] default is 7 (August)
 * @param {number} [options.date=31] default is 31
 */
const collectPreviousSeasonStats = async ({ month = 7, date = 31 } = { month: 7, date: 31 }) => {
  try {
    logger.info(`previous season stats jobs`);

    const storageDate = new Date();
    storageDate.setMonth(month, date);
    logger.info(
      `Storage date is : ${storageDate.toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    );

    if (isSameDate(new Date(), storageDate)) {
      logger.info(`Storage date is today, let's store !`);
      await storePreviousSeasonFormations();
      return;
    }

    // else compare to get causes why trainings are no more in affelnet or parcoursup scope
    // TODO compare

    logger.info(`End previous season stats jobs`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = collectPreviousSeasonStats;

if (process.env.standaloneJobs) {
  /**
   * call script with cli arg `--date=31/05` for 31 May for instance
   */
  runScript(async () => {
    const args = process.argv.slice(2);
    const date = args.find((arg) => arg.startsWith("--date"))?.split("=")?.[1];

    let options;
    if (date) {
      const [dateStr, monthStr] = date.split("/");
      options = { month: Number(monthStr) - 1, date: Number(dateStr) };
    }

    await collectPreviousSeasonStats(options);
  });
}
