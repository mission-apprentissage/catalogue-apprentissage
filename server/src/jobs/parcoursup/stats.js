const { runScript } = require("../scriptWrapper");

const { PARCOURSUP_STATUS } = require("../../constants/status");
const { ConsoleStat, Formation } = require("../../common/model");

// TODO :
// - Evolution des organismes
//   > Organismes ayant au moins une formation publiée
//   > Organismes ayant au moins une formation intégrable

// - Evolution des formations
//   > Formations publiées
//   > Formations intégrables

const stats = () => {
  const formations_publiees = Formation.countDocuments({ parcoursup_statut: PARCOURSUP_STATUS.PUBLIE });
  console.log(formations_publiees);
  const formations_integrables = Formation.countDocuments({
    parcoursup_statut: { $ne: PARCOURSUP_STATUS.HORS_PERIMETRE },
  });
  console.log(formations_integrables);

  const organismes_avec_formations_publiees = Formation.distinct("etablissement_gestionnaire_id", {
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });

  console.log(organismes_avec_formations_publiees);
  // const organismes_avec_formations_integrables =
  // console.log(organismes_avec_formations_integrables);

  ConsoleStat.create({
    perimetre: "parcoursup",
    date: new Date(),
    formations_publiees,
    formations_integrables,
    // organismes_avec_formations_publiees,
    // organismes_avec_formations_integrables,
  });
};

module.exports = { stats };

if (process.env.standalone) {
  runScript(async () => {
    await stats();
  });
}
