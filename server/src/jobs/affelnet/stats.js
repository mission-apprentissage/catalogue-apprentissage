const { runScript } = require("../scriptWrapper");

const { AFFELNET_STATUS } = require("../../constants/status");
const { ConsoleStat, Formation } = require("../../common/model");

const stats = async () => {
  console.log(`--- Calcul des statistiques Affelnet ---`);

  const filterPublie = { affelnet_statut: AFFELNET_STATUS.PUBLIE };
  const filterIntegrable = {
    affelnet_statut: { $ne: AFFELNET_STATUS.HORS_PERIMETRE },
  };
  const formations_publiees = await Formation.countDocuments(filterPublie);
  console.log(`Formations publiées : ${formations_publiees}`);
  const formations_integrables = await Formation.countDocuments(filterIntegrable);
  console.log(`Formations intégrables : ${formations_integrables}`);

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

  console.log(`Organismes avec formations publiées : ${organismes_avec_formations_publiees}`);

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

  console.log(`Organismes avec formations intégrables : ${organismes_avec_formations_integrables}`);

  await ConsoleStat.create({
    plateforme: "affelnet",
    formations_publiees,
    formations_integrables,
    organismes_avec_formations_publiees,
    organismes_avec_formations_integrables,
  });
};

module.exports = { stats };

if (process.env.standalone) {
  runScript(async () => {
    await stats();
  });
}
