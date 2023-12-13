const { getModels } = require("@mission-apprentissage/tco-service-node");

const cfdEntreeMap = {
  "32033422": ["32033423", "32033424", "32033425"],
  "32022316": ["32022317", "32022318"],
  "32032209": ["32032210", "32032211"],
  "32032612": ["32032613", "32032614"],
  "32022310": ["32022311", "32022312"],
  "32033608": ["32033610", "32033609", "32033611"],
};

const getCfdEntree = (cfd) => {
  const entry = Object.entries(cfdEntreeMap).find(([, values]) => values.includes(cfd));
  return entry ? entry[0] : cfd;
};

const getCfdEntreeDateFermeture = async (cfd) => {
  const Models = await getModels();
  const cfd_entree = getCfdEntree(cfd);
  const bcnFormationDiplome = await Models.BcnFormationDiplome.findOne({ FORMATION_DIPLOME: cfd_entree });

  const dateParts = bcnFormationDiplome?.DATE_FERMETURE.split("/");

  return bcnFormationDiplome?.DATE_FERMETURE ? new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]) : null;
};

module.exports = {
  getCfdEntree,
  getCfdEntreeDateFermeture,
};
