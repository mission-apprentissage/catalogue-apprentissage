const { runScript } = require("../scriptWrapper");

const { PARCOURSUP_STATUS } = require("../../constants/status");
const { ConsoleStat, Formation } = require("../../common/model");
const { academies } = require("../../constants/academies");
const logger = require("../../common/logger");

const computeStats = async (academie = null) => {
  const globalFilter = { published: true };
  const scopeFilter = academie ? { nom_academie: academie } : {};
  // const scopeLog = academie ? `[${academie}]` : `[global]`;

  const filterPublie = {
    ...globalFilter,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    ...scopeFilter,
  };
  const filterIntegrable = {
    ...globalFilter,
    parcoursup_statut: { $ne: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT },
    ...scopeFilter,
  };
  const filterPerimetre = {
    ...globalFilter,
    parcoursup_perimetre: true,
    ...scopeFilter,
  };

  const formations_publiees = await Formation.countDocuments(filterPublie);
  // console.log(`${scopeLog} Formations publiées : ${formations_publiees}`);
  const formations_integrables = await Formation.countDocuments(filterIntegrable);
  // console.log(`${scopeLog} Formations intégrables : ${formations_integrables}`);
  const formations_perimetre = await Formation.countDocuments(filterPerimetre);
  // console.log(`${scopeLog} Formations dans le périmètre : ${formations_integrables}`);

  const organismes_gestionnaires_avec_formations_publiees = await Formation.distinct(
    "etablissement_gestionnaire_id",
    filterPublie
  );
  const organismes_formateurs_avec_formations_publiees = await Formation.distinct(
    "etablissement_formateur_id",
    filterPublie
  );

  const organismes_avec_formations_publiees = [
    ...new Set([
      ...organismes_gestionnaires_avec_formations_publiees,
      ...organismes_formateurs_avec_formations_publiees,
    ]),
  ].length;

  // console.log(`${scopeLog} Organismes avec formations publiées : ${organismes_avec_formations_publiees}`);

  const organismes_gestionnaires_avec_formations_integrables = await Formation.distinct(
    "etablissement_gestionnaire_id",
    filterIntegrable
  );
  const organismes_formateurs_avec_formations_integrables = await Formation.distinct(
    "etablissement_formateur_id",
    filterIntegrable
  );

  const organismes_avec_formations_integrables = [
    ...new Set([
      ...organismes_gestionnaires_avec_formations_integrables,
      ...organismes_formateurs_avec_formations_integrables,
    ]),
  ].length;

  // console.log(`${scopeLog} Organismes avec formations intégrables : ${organismes_avec_formations_integrables}`);

  const organismes_gestionnaires_avec_formations_perimetre = await Formation.distinct(
    "etablissement_gestionnaire_id",
    filterPerimetre
  );
  const organismes_formateurs_avec_formations_perimetre = await Formation.distinct(
    "etablissement_formateur_id",
    filterPerimetre
  );

  const organismes_avec_formations_perimetre = [
    ...new Set([
      ...organismes_gestionnaires_avec_formations_perimetre,
      ...organismes_formateurs_avec_formations_perimetre,
    ]),
  ].length;

  // console.log(`${scopeLog} Organismes avec formations dans le périmètre : ${organismes_avec_formations_perimetre}`);

  const details = (
    await Promise.all(
      Object.values(PARCOURSUP_STATUS).flatMap(async (value) => ({
        [value]: await Formation.countDocuments({ ...globalFilter, parcoursup_statut: value, ...scopeFilter }),
      }))
    )
  ).reduce(function (result, current) {
    return Object.assign(result, current);
  }, {});

  return {
    academie,
    formations_publiees,
    formations_integrables,
    formations_perimetre,
    organismes_avec_formations_publiees,
    organismes_avec_formations_integrables,
    organismes_avec_formations_perimetre,
    details,
  };
};

/**
 * Calcul des statistiques Parcoursup à destination des consoles de pilotages
 */
const psConsoleStats = async () => {
  logger.info({ type: "job" }, " -- PARCOURSUP STATISTIQUES : ⏳ -- ");
  const date = new Date();

  await Promise.all(
    [null, ...Object.values(academies).map((academie) => academie.nom_academie)].map(async (academie) => {
      const stats = await computeStats(academie);
      return await ConsoleStat.create({ plateforme: "parcoursup", date, ...stats });
    })
  );
  logger.info({ type: "job" }, " -- PARCOURSUP STATISTIQUES : ✅ -- ");
};

module.exports = { psConsoleStats };

if (process.env.standalone) {
  runScript(async () => {
    await psConsoleStats();
  });
}
