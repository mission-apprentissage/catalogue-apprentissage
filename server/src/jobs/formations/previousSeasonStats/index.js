// @ts-check
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { PreviousSeasonFormation, Formation, PreviousSeasonFormationStat } = require("../../../common/model");
const { isSameDate } = require("../../../common/utils/dateUtils");
const { isInSession } = require("../../../common/utils/rulesUtils");
const { academies } = require("../../../constants/academies");

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */
/** @typedef {import("../../../common/model/schema/previousSeasonFormation").PreviousSeasonFormation} PreviousSeasonFormation */

/**
 * @param {Formation} formation
 * @param {"affelnet" | "parcoursup"} plateforme
 */
const isInScope = (formation, plateforme) =>
  plateforme === "affelnet" ? isInAffelnetScope(formation) : isInParcoursupScope(formation);

/**
 * @param {Formation} formation
 */
const isInAffelnetScope = ({ affelnet_perimetre }) => affelnet_perimetre;

/**
 * @param {Formation} formation
 */
const isInParcoursupScope = ({ parcoursup_perimetre }) => parcoursup_perimetre;

/**
 * Sauvegarde les informations relatives au périmètre pour la date donnée. Va ainsi permettre de comparer les formations pour savoir les raisons de la disparition du périmètre.
 */
const storePreviousSeasonFormations = async () => {
  // empty previous stats collection
  await PreviousSeasonFormation.deleteMany({});

  // then store season formations
  const query = {
    published: true,
    catalogue_published: true,
    $or: [
      { affelnet_perimetre: true, affelnet_session: true },
      { parcoursup_perimetre: true, parcoursup_session: true },
    ],
  };

  const select = {
    cle_ministere_educatif: 1,
    num_academie: 1,
    affelnet_statut: 1,
    affelnet_perimetre: 1,
    affelnet_session: 1,
    parcoursup_statut: 1,
    parcoursup_perimetre: 1,
    parcoursup_session: 1,
  };

  /**
   * @type {import("mongoose").QueryCursor<Formation>}
   */
  const cursor = Formation.find(query, select).lean().cursor();

  for await (const formation of cursor) {
    await PreviousSeasonFormation.create({
      ...formation,
    });
  }
};

/**
 * Compare to get academyCauses why trainings are no more in affelnet or parcoursup scope
 * @param {"affelnet"|"parcoursup"} plateforme
 */
const comparePreviousSeasonFormations = async (plateforme) => {
  const initialValues = { closed: 0, qualiopi_lost: 0, not_updated: 0, /*diplome: 0,*/ other: 0 };
  const filter = plateforme === "affelnet" ? { affelnet_perimetre: true } : { parcoursup_perimetre: true };

  const cursor = PreviousSeasonFormation.find(filter).lean().cursor();
  const academyCauses = new Map();
  const today = new Date();

  for await (const previousFormation of cursor) {
    const academyName =
      academies[`${previousFormation.num_academie}`.padStart(2, "0")]?.nom_academie ?? previousFormation.num_academie;

    const found = /** @type {Formation} */ (
      await Formation.findOne(
        { cle_ministere_educatif: previousFormation.cle_ministere_educatif },
        {
          affelnet_statut: 1,
          parcoursup_statut: 1,
          etablissement_gestionnaire_certifie_qualite: 1,
          date_debut: 1,
          affelnet_perimetre: 1,
          parcoursup_perimetre: 1,
          affelnet_session: 1,
          parcoursup_session: 1,
          niveau: 1,
          diplome: 1,
          num_academie: 1,
          published: 1,
        }
      ).lean()
    );

    const academyCause = academyCauses.get(academyName) ?? { ...initialValues };

    // Si la formation n'existe plus (on ne la retrouve pas) : on incrémente le compteur "closed" par académie.
    if (!found || !found.published) {
      academyCause.closed = academyCause.closed + 1;
      academyCauses.set(academyName, academyCause);
      continue;
    }

    // Si la formation existe toujours et est dans le périmètre : ok on continue.
    if (found && found.published && isInScope(found, plateforme) && isInSession(found)) {
      academyCauses.set(academyName, academyCause);
      continue;
    }

    // Si la formation existe, mais la période n'est pas à jour : on incrémente "not_updated".
    if (found && found.published && isInScope(found, plateforme) && !isInSession(found)) {
      academyCause.not_updated = academyCause.not_updated + 1;
      academyCauses.set(academyName, academyCause);
      continue;
    }

    // Si la formation existe mais n'est plus qualiopi : on incrémente "qualiopi_lost".
    if (found && found.published && !found.etablissement_gestionnaire_certifie_qualite) {
      academyCause.qualiopi_lost = academyCause.qualiopi_lost + 1;
      academyCauses.set(academyName, academyCause);
      continue;
    }

    // // Si la formation existe, mais le diplome ne correspond plus aux règles de périmètre : on incrémente "diplome".
    // const rulesOk = await ReglePerimetre.find({
    //   plateforme,
    //   niveau: found.niveau,
    //   diplome: found.diplome,
    //   num_academie: { $in: [0, found.num_academie] },
    //   is_deleted: false,
    //   condition_integration: { $in: ["peut intégrer", "doit intégrer"] },
    // });
    // const rulesNotOk = await ReglePerimetre.find({
    //   plateforme,
    //   niveau: found.niveau,
    //   diplome: found.diplome,
    //   num_academie: { $in: [0, found.num_academie] },
    //   is_deleted: false,
    //   condition_integration: { $in: ["ne doit pas intégrer"] },
    // });

    // if (!rulesOk.length || !!rulesNotOk.length) {
    //   academyCause.diplome = academyCause.diplome + 1;
    //   academyCauses.set(academyName, academyCause);
    //   continue;
    // }

    // Sinon on incrémente "other".
    academyCause.other = academyCause.other + 1;
    academyCauses.set(academyName, academyCause);
  }

  const global = { ...initialValues };

  const results = await Promise.all(
    [...academyCauses.entries()].map(async ([academie, cause]) => {
      global.closed = global.closed + cause.closed;
      global.qualiopi_lost = global.qualiopi_lost + cause.qualiopi_lost;
      global.not_updated = global.not_updated + cause.not_updated;
      // global.diplome = global.diplome + cause.diplome;
      global.other = global.other + cause.other;

      return await PreviousSeasonFormationStat.create({
        plateforme,
        academie,
        date: today,
        ...(cause ?? {}),
      });
    })
  );

  console.log({ results });

  const result = await PreviousSeasonFormationStat.create({
    plateforme,
    academie: null,
    date: today,
    ...(global ?? {}),
  });

  console.log({ result });
};

/**
 * @param {object} options
 * @param {number} [options.month=6] default is 6 (July). Starts from 0 for January
 * @param {number} [options.date=31] default is 31
 */
const collectPreviousSeasonStats = async ({ month = 6, date = 31 } = { month: 6, date: 31 }) => {
  try {
    logger.info({ type: "job" }, `previous season stats jobs`);

    const storageDate = new Date();
    storageDate.setMonth(month, date);
    logger.info(
      { type: "job" },
      `Storage date is : ${storageDate.toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    );

    if (isSameDate(new Date(), storageDate)) {
      logger.info({ type: "job" }, `Storage date is today, let's store !`);
      await storePreviousSeasonFormations();
      return;
    }

    await comparePreviousSeasonFormations("affelnet");
    await comparePreviousSeasonFormations("parcoursup");

    logger.info({ type: "job" }, `End previous season stats jobs`);
  } catch (error) {
    logger.error(
      {
        type: "job",
      },
      error
    );
  }
};

module.exports = { collectPreviousSeasonStats };

if (process.env.standalone) {
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
