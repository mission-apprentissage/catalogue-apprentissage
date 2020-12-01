function generateMatching(mode, matchType, ligne, catalogue) {
  const uai = (catalogue) =>
    catalogue.uai_formation === ligne.uai_gestionnaire ||
    catalogue.uai_formation === ligne.uai_composante ||
    catalogue.uai_formation === ligne.uai_affilie ||
    catalogue.etablissement_formateur_uai === ligne.uai_gestionnaire ||
    catalogue.etablissement_formateur_uai === ligne.uai_composante ||
    catalogue.etablissement_formateur_uai === ligne.uai_affilie ||
    catalogue.etablissement_gestionnaire_uai === ligne.uai_gestionnaire ||
    catalogue.etablissement_gestionnaire_uai === ligne.uai_composante ||
    catalogue.etablissement_gestionnaire_uai === ligne.uai_affilie;

  const cp = (catalogue) =>
    catalogue.etablissement_gestionnaire_code_postal === ligne.code_postal ||
    catalogue.code_postal === ligne.code_postal ||
    catalogue.etablissement_formateur_code_postal === ligne.code_postal;

  const insee = (catalogue) => catalogue.code_commune_insee === ligne.code_commune_insee;

  const academie = (catalogue) => catalogue.nom_academie === ligne.nom_academie;

  const cfd = (catalogue) => catalogue.cfd === ligne.code_cfd;

  const duo1 = (catalogue) =>
    catalogue.cfd === ligne.code_cfd && catalogue.num_departement === ligne.code_postal.substring(0, 2);

  const mef = (catalogue) => catalogue.mef_10_code === ligne.code_mef_10;

  const dept = (catalogue) => catalogue.num_departement === ligne.code_postal.substring(0, 2);

  // const duo2 =
  //   catalogue.educ_nat_code === ligne.CODECFD2 && catalogue.num_departement === ligne.code_postal.substring(0, 2);

  // const duo3 =
  //   catalogue.educ_nat_code === ligne.CODECFD3 && catalogue.num_departement === ligne.code_postal.substring(0, 2);

  const filter = (condition) => catalogue.filter((catalogue) => condition(catalogue));

  if (mode === "UAI") {
    switch (matchType) {
      case "1":
        return filter(uai);
      case "2":
        return filter((i) => uai(i) && duo1(i));
      case "3":
        return filter((i) => uai(i) && cfd(i) && insee(i));
      case "4":
        return filter((i) => uai(i) && cfd(i) && insee(i) && cp(i));
      case "5":
        return filter((i) => uai(i) && cfd(i) && insee(i) && cp(i) && academie(i));
      case "6":
        return filter((i) => uai(i) && cfd(i) && insee(i) && cp(i) && academie(i) && mef(i));
      default:
        break;
    }
  } else {
    switch (matchType) {
      case "1":
        return filter(cfd);
      case "2":
        return filter((i) => cfd(i) && dept(i));
      case "3":
        return filter((i) => cfd(i) && insee(i));
      case "4":
        return filter((i) => cfd(i) && insee(i) && cp(i));
      case "5":
        return filter((i) => cfd(i) && insee(i) && cp(i) && academie(i));
      case "6":
        return filter((i) => cfd(i) && insee(i) && cp(i) && academie(i) && mef(i));
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
  (ligne, catalogue) => generateMatching("UAI", "6", ligne, catalogue),
];

let predicateCFD = [
  (ligne, catalogue) => generateMatching("CFD", "1", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "2", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "3", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "4", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "5", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "6", ligne, catalogue),
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
      data: x,
    });
  });

  // no match on uai (case 1)
  if (resultsUAI[0].length === 0) {
    let resultsCFD = predicateCFD.map((p) => p(ligne, catalogue));

    resultsCFD.forEach((x, index) => {
      buffer.matching_cfd.push({
        matching_strengh: index + 1,
        data_length: x.length,
        data: x,
      });
    });
  }

  return buffer;
};
