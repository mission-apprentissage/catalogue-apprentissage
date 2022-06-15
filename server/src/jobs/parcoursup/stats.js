const { runScript } = require("../scriptWrapper");

const { PARCOURSUP_STATUS } = require("../../constants/status");
const { ConsoleStat, Formation } = require("../../common/model");
const { academies } = require("../../constants/academies");

const computeStats = async (academie = undefined) => {
  const scopeFilter = academie !== undefined ? { nom_academie: academie } : {};
  // const scopeLog = academie !== undefined ? `[${academie}]` : `[global]`;

  const filterPublie = {
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    ...scopeFilter,
  };
  const filterIntegrable = {
    parcoursup_statut: { $ne: PARCOURSUP_STATUS.HORS_PERIMETRE },
    ...scopeFilter,
  };

  const formations_publiees = await Formation.countDocuments(filterPublie);
  // console.log(`${scopeLog} Formations publiées : ${formations_publiees}`);
  const formations_integrables = await Formation.countDocuments(filterIntegrable);
  // console.log(`${scopeLog} Formations intégrables : ${formations_integrables}`);

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

  const details = (
    await Promise.all(
      Object.values(PARCOURSUP_STATUS).flatMap(async (value) => ({
        [value]: await Formation.countDocuments({ parcoursup_statut: value }),
      }))
    )
  ).reduce(function (result, current) {
    return Object.assign(result, current);
  }, {});

  return {
    formations_publiees,
    formations_integrables,
    organismes_avec_formations_publiees,
    organismes_avec_formations_integrables,
    details,
  };
};

const stats = async () => {
  console.log(`--- Calcul des statistiques Parcoursup ---`);

  const stat = {
    plateforme: "parcoursup",
    ...[
      ...(await Promise.all([
        { "Toute la France": await computeStats() },
        ...Object.values(academies).map(async (academie) => ({
          [academie.nom_academie]: await computeStats(academie.nom_academie),
        })),
      ])),
    ].reduce(function (result, current) {
      return Object.assign(result, current);
    }, {}),
  };

  return await ConsoleStat.create(stat);
};

module.exports = { stats };

if (process.env.standalone) {
  runScript(async () => {
    await stats();
  });
}
