const { formation } = require("./mapper");

function generateMatching(mode, matchType, ligne, catalogue) {
  const uai = (catalogue) =>
    catalogue.uai_formation === ligne.uai ||
    catalogue.etablissement_formateur_uai === ligne.uai ||
    catalogue.etablissement_gestionnaire_uai === ligne.uai;

  const cp = (catalogue) =>
    catalogue.etablissement_gestionnaire_code_postal === ligne.code_postal ||
    catalogue.code_postal === ligne.code_postal ||
    catalogue.etablissement_formateur_code_postal === ligne.code_postal;

  const academie = (catalogue) => catalogue.nom_academie === ligne.academie;

  const cfd = (catalogue) => catalogue.cfd === ligne.code_cfd;

  const libelle = (catalogue) => ligne.libelle_ban.includes(catalogue.intitule_court);

  const filter = (condition) => catalogue.filter((catalogue) => condition(catalogue));

  if (mode === "UAI") {
    switch (matchType) {
      case "1":
        return filter((i) => uai(i));
      case "2":
        return filter((i) => uai(i) && cfd(i));
      case "3":
        return filter((i) => uai(i) && cfd(i) && cp(i));
      case "4":
        return filter((i) => uai(i) && cfd(i) && cp(i) && academie(i));
      case "5":
        return filter((i) => uai(i) && cfd(i) && cp(i) && academie(i) && libelle(i));
      default:
        break;
    }
  } else {
    switch (matchType) {
      case "1":
        return filter((i) => cfd(i));
      case "2":
        return filter((i) => cfd(i) && cp(i));
      case "3":
        return filter((i) => cfd(i) && cp(i) && academie(i));
      case "4":
        return filter((i) => cfd(i) && cp(i) && academie(i) && libelle(i));
      default:
        break;
    }
  }
}

let predicateUAI = [
  (ligne, catalogue) => generateMatching("UAI", "1", ligne, catalogue),
  (ligne, catalogue) => generateMatching("UAI", "2", ligne, catalogue),
  (ligne, catalogue) => generateMatching("UAI", "3", ligne, catalogue),
  (ligne, catalogue) => generateMatching("UAI", "4", ligne, catalogue),
  (ligne, catalogue) => generateMatching("UAI", "5", ligne, catalogue),
];

let predicateCFD = [
  (ligne, catalogue) => generateMatching("CFD", "1", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "2", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "3", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "4", ligne, catalogue),
];

module.exports = (ligne, catalogue) => {
  let buffer = {
    formation: ligne,
    matching_uai: [],
    matching_cfd: [],
  };

  let resultsUAI = predicateUAI.map((p) => p(ligne, catalogue));

  resultsUAI.forEach((x, index) => {
    buffer.matching_uai.push({
      matching_strengh: index + 1,
      data_length: x.length,
      data: formation(x),
    });
  });

  // no match on uai (case 1)
  if (resultsUAI[0].length === 0) {
    let resultsCFD = predicateCFD.map((p) => p(ligne, catalogue));

    resultsCFD.forEach((x, index) => {
      buffer.matching_cfd.push({
        matching_strengh: index + 1,
        data_length: x.length,
        data: formation(x),
      });
    });
  }

  return buffer;
};
