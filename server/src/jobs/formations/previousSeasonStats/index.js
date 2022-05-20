// @ts-check
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { isSameDate } = require("../../../common/utils/dateUtils");
const { PreviousSeasonFormation, Formation, PreviousSeasonFormationStat } = require("../../../common/model");
const { PARCOURSUP_STATUS, AFFELNET_STATUS } = require("../../../constants/status");
const { academies } = require("../../../constants/academies");

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */
/** @typedef {import("../../../common/model/schema/previousSeasonFormation").PreviousSeasonFormation} PreviousSeasonFormation */

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
 * @param {"affelnet" | "parcoursup"} plateforme
 */
const isInScope = (formation, plateforme) =>
  plateforme === "affelnet" ? isInAffelnetScope(formation) : isInParcoursupScope(formation);

/**
 * @param {Formation} formation
 */
const isInAffelnetScope = ({ affelnet_statut }) => inScopeAffelnetStatuses.includes(affelnet_statut);

/**
 * @param {Formation} formation
 */
const isInParcoursupScope = ({ parcoursup_statut }) => inScopeParcoursupStatuses.includes(parcoursup_statut);

/**
 * @param {Formation} formation
 * @returns {"affelnet" | "parcoursup"}
 */
const getPlateforme = ({ affelnet_statut }) => (isInAffelnetScope({ affelnet_statut }) ? "affelnet" : "parcoursup");

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
 * Compare to get causes why trainings are no more in affelnet or parcoursup scope
 * @param {"affelnet"|"parcoursup"} plateforme
 */
const comparePreviousSeasonFormations = async (plateforme) => {
  /**
   * @type {import("mongoose").QueryCursor<PreviousSeasonFormation>}
   */
  const cursor = PreviousSeasonFormation.find({ plateforme }).lean().cursor();
  const causes = {};
  const today = new Date();

  for await (const previousFormation of cursor) {
    const academyName =
      academies[`${previousFormation.num_academie}`.padStart(2, "0")].nom_academie ?? previousFormation.num_academie;

    const found = /** @type {Formation} */ (await Formation.findOne(
      { cle_ministere_educatif: previousFormation.cle_ministere_educatif },
      { affelnet_statut: 1, parcoursup_statut: 1, etablissement_gestionnaire_certifie_qualite: 1, periode: 1 }
    ).lean());

    // Si la formation existe toujours et est dans le périmètre, ok on continue.
    if (found && isInScope(found, plateforme)) {
      continue;
    }

    causes[academyName] = { ...causes[academyName] };
    // Si la formation n'existe plus (on ne la retouve pas): on incrémente le compteur "closed" par académie.
    if (!found) {
      causes[academyName]["closed"] = (causes[academyName]["closed"] ?? 0) + 1;
      continue;
    }

    // Si la formation existe mais n'est plus qualiopi on incrémente "qualiopi_lost".
    if (!found.etablissement_gestionnaire_certifie_qualite) {
      causes[academyName]["qualiopi_lost"] = (causes[academyName]["qualiopi_lost"] ?? 0) + 1;
      continue;
    }
    // Si la formation existe, mais la période n'est pas à jour on incrémente "not_updated".
    const lastPeriode = found.periode?.pop();
    if (!lastPeriode || today > new Date(lastPeriode)) {
      causes[academyName]["not_updated"] = (causes[academyName]["not_updated"] ?? 0) + 1;
      continue;
    }

    // Sinon on incrémente "other".
    causes[academyName]["other"] = (causes[academyName]["other"] ?? 0) + 1;
  }

  await PreviousSeasonFormationStat.create({
    plateforme,
    vanishing_scope_causes: causes ?? {},
  });
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

    await comparePreviousSeasonFormations("affelnet");
    await comparePreviousSeasonFormations("parcoursup");

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
