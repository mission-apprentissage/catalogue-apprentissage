const infosCodes = {
  cfd: {
    OutDated: 0,
    NotFound: 1,
    Found: 2,
    Updated: 3,
  },
  niveau: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
  },
  intitule: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
  },
  diplome: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
  },
  specialite: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
    NotProvided: 3,
  },
  mef: {
    Error: 0,
    NotFound: 1,
    NothingDoTo: 2,
    Updated: 3,
    Multiple: 4,
  },
};

const computeCodes = {
  cfd: ["Périmé", "Non trouvé", "Trouvé", "Mis à jour"],
  niveau: ["Erreur", "Ok", "Mis à jour"],
  intitule: ["Erreur", "Ok", "Mis à jour"],
  diplome: ["Erreur", "Ok", "Mis à jour"],
  specialite: ["Erreur", "Ok", "Mis à jour", "Non fourni"],
  mef: ["Erreur", "Non trouvé", "Ok", "Mis à jour", "Erreur Plusieurs code CFD trouvé"],
};

const niveaux = [
  "3 (CAP...)",
  "4 (BAC...)",
  "5 (BTS, DEUST...)",
  "6 (Licence, BUT...)",
  "7 (Master, titre ingénieur...)",
  "8 (Doctorat...)",
];
const mappingNiveauCodeEn = {
  "5": 3,
  "4": 4,
  "3": 5,
  "2": 6,
  "1": 7,
  "8": 8,
  "0102": 3,
  "0103": 4,
  "01025122": 4,
  "01025310": 4,
  "01025406": 4,
  "01023304": 4,
  "01022704": 4,
  "01022705": 4,
  "01025002": 4,
  "01025508": 4,
  "01025308": 4,
  "01025312": 4,
  "01023306": 4,
  "01025408": 4,
  "01025123": 4,
  "01022001": 4,
  "01025309": 4,
  "01022703": 4,
  "01025407": 4,
  "01025409": 4,
};

const mappingCodesEnNiveau = niveaux.reduce((acc, niveau, index) => {
  const filteredMapping = Object.entries(mappingNiveauCodeEn).filter(([, value]) => value === index + 3);
  acc[niveau] = filteredMapping.map(([key]) => key);
  return acc;
}, {});

module.exports = {
  infosCodes,
  computeCodes,
  mappingNiveauCodeEn,
  niveaux,
  mappingCodesEnNiveau,
};
