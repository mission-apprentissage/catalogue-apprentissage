// @ts-check
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { isSameDate } = require("../../../common/utils/dateUtils");
const { PreviousSeasonFormation, Formation } = require("../../../common/model");

const inScopeAffelnetStatuses = ["publié", "à publier (soumis à validation)", "à publier", "en attente de publication"];
const inScopeParcoursupStatuses = [
  "publié",
  "à publier (sous condition habilitation)",
  "à publier (vérifier accès direct postbac)",
  "à publier (soumis à validation Recteur)",
  "à publier",
  "en attente de publication",
];

/**
 * @param {{affelnet_statut: string}} formation
 * @returns {"affelnet" | "parcoursup"}
 */
const getPlateforme = ({ affelnet_statut }) => {
  return inScopeAffelnetStatuses.includes(affelnet_statut) ? "affelnet" : "parcoursup";
};

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
const collectPreviousSeasonStats = async ({ month, date } = { month: 7, date: 31 }) => {
  try {
    logger.info(`previous season stats jobs`);

    const storageDate = new Date();
    storageDate.setMonth(month, date);

    if (isSameDate(new Date(), storageDate)) {
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
  runScript(async () => {
    await collectPreviousSeasonStats();
  });
}
