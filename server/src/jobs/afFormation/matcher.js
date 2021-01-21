const { formation } = require("./mapper");
// const { capitalize } = require("lodash");

function generateMatching(mode, matchType, ligne, catalogue) {
  // const uai = (catalogue) =>
  //   catalogue.uai_formation === ligne.uai ||
  //   catalogue.etablissement_formateur_uai === ligne.uai ||
  //   catalogue.etablissement_gestionnaire_uai === ligne.uai;

  // const academieFormated = ligne.academie
  //   .split("-")
  //   .filter((x) => x)
  //   .map((x) => capitalize(x))
  //   .join("-");

  const cp = (catalogue) =>
    `${catalogue.etablissement_gestionnaire_code_postal}` === `${ligne.code_postal_modified.code_postal}` ||
    `${catalogue.code_postal}` === `${ligne.code_postal_modified.code_postal}` ||
    `${catalogue.etablissement_formateur_code_postal}` === `${ligne.code_postal_modified.code_postal}`;

  const dept = (catalogue) =>
    `${catalogue.num_departement}` === `${ligne.code_postal_modified.code_postal.substring(0, 2)}`;

  // const academie = (catalogue) =>
  //   ligne.code_postal_modified
  //     ? `${catalogue.num_academie}` === `${ligne.code_postal_modified.num_academie}`
  //     : catalogue.nom_academie === academieFormated;

  const cfd = (catalogue) => catalogue.cfd === ligne.code_cfd;

  // const libelle = (catalogue) => ligne.libelle_ban.includes(catalogue.intitule_court);

  const filter = (condition) => {
    let result = catalogue.filter((catalogue) => condition(catalogue));
    return {
      data: result,
      strengh: matchType,
    };
  };

  // if (mode === "UAI") {
  //   switch (matchType) {
  //     case "1":
  //       return filter((i) => uai(i));
  //     case "2":
  //       return filter((i) => uai(i) && cfd(i));
  //     case "3":
  //       return filter((i) => uai(i) && cfd(i) && cp(i));
  //     case "4":
  //       return filter((i) => uai(i) && cfd(i) && cp(i) && academie(i));
  //     case "5":
  //       return filter((i) => uai(i) && cfd(i) && cp(i) && academie(i) && libelle(i));
  //     default:
  //       break;
  //   }
  // } else {
  switch (matchType) {
    case "1":
      return filter((i) => cfd(i));
    case "2":
      return filter((i) => cfd(i) && dept(i));
    case "3":
      return filter((i) => cfd(i) && dept(i) && cp(i));
    default:
      break;
  }
  // }
}

let predicateCFD = [
  (ligne, catalogue) => generateMatching("CFD", "3", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "2", ligne, catalogue),
  (ligne, catalogue) => generateMatching("CFD", "1", ligne, catalogue),
];

module.exports = (ligne, catalogue) => {
  let buffer = {
    formation: ligne,
    // matching_uai: [],
    matching_cfd: [],
  };

  for (let i = 0; i < predicateCFD.length; i++) {
    let predicate = predicateCFD[i];
    let { data, strengh } = predicate(ligne, catalogue);

    if (data.length === 1) {
      buffer.matching_cfd.push({
        matching_strengh: strengh,
        data_length: data.length,
        data: formation(data),
      });
      break;
    }

    if (data.length > 0) {
      buffer.matching_cfd.push({
        matching_strengh: strengh,
        data_length: data.length,
        data: formation(data),
      });
      break;
    }
  }

  return buffer;
};
