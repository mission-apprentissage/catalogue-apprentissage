const { formation } = require("./mapper");

function generateMatching(matchType, ligne, catalogue) {
  const cp = (catalogue) =>
    `${catalogue.etablissement_gestionnaire_code_postal}` === `${ligne.code_postal_modified.code_postal}` ||
    `${catalogue.code_postal}` === `${ligne.code_postal_modified.code_postal}` ||
    `${catalogue.etablissement_formateur_code_postal}` === `${ligne.code_postal_modified.code_postal}`;

  const dept = (catalogue) =>
    `${catalogue.num_departement}` === `${ligne.code_postal_modified.code_postal.substring(0, 2)}`;

  const cfd = (catalogue) => catalogue.cfd === ligne.code_cfd;

  const filter = (condition) => {
    let result = catalogue.filter((catalogue) => condition(catalogue));
    return {
      data: result,
      strengh: matchType,
    };
  };

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
}

module.exports = (ligne, catalogue) => {
  let buffer = {
    formation: ligne,
    matching_cfd: [],
  };

  let predicateCFD = [
    (ligne, catalogue) => generateMatching("3", ligne, catalogue),
    (ligne, catalogue) => generateMatching("2", ligne, catalogue),
    (ligne, catalogue) => generateMatching("1", ligne, catalogue),
  ];

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
