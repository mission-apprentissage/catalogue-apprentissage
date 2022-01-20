/**
 * Pour appliquer les étiquettes pour les plateformes PS & Affelnet
 * une formation doit avoir au moins une période d'inscription >= septembre de l'année scolaire suivante
 * eg: si on est en janvier 2022 --> septembre 2022, si on est le en octobre 2022 --> septembre 2023, etc.
 * Si ce n'est pas le cas la formation sera "hors périmètre".
 */
const getPeriodeStartDate = (currentDate = new Date()) => {
  let durationShift = 0;
  const now = currentDate;
  const sessionStart = new Date(`${currentDate.getFullYear()}-09-01T00:00:00.000Z`);
  if (now >= sessionStart) {
    durationShift = 1;
  }
  return new Date(`${currentDate.getFullYear() + durationShift}-09-01T00:00:00.000Z`);
};

const commonRules = {
  cfd_outdated: { $ne: true },
  published: true,
  etablissement_reference_catalogue_published: true,
  etablissement_gestionnaire_catalogue_published: true, // ensure gestionnaire is Qualiopi certified
  periode: { $gte: getPeriodeStartDate() },
};

const toBePublishedRulesParcousup = {
  $and: [
    {
      ...commonRules,
      annee: { $in: ["1", "9", "X"] },
    },
  ],
};

const toBePublishedRulesAffelnet = {
  $and: [
    {
      ...commonRules,
      annee: { $ne: "X" },
    },
  ],
};

const getPublishedRules = (plateforme) => {
  switch (plateforme) {
    case "affelnet":
      return toBePublishedRulesAffelnet;

    case "parcoursup":
      return toBePublishedRulesParcousup;

    default:
      throw new Error(`Invalid plateforme : ${plateforme}`);
  }
};

module.exports = { getPublishedRules, getPeriodeStartDate };
