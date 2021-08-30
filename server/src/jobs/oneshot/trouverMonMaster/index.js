const axios = require("axios");
const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { ConvertedFormation } = require("../../../common/model");
const { DateTime } = require("luxon");
const config = require("config");
const path = require("path");
const { chunkedAsyncForEach } = require("../../../common/utils/asyncUtils");

const lieuxUrl =
  "https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-tmm-donnees-du-portail-dinformation-trouver-mon-master-lieux-de-formation/download/?format=json&timezone=Europe/Berlin&lang=fr";

const mentionsUrl =
  "https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-tmm-donnees-du-portail-dinformation-trouver-mon-master-mentions-de-master/download/?format=json&timezone=Europe/Berlin&lang=fr";

const parcoursUrl =
  "https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-tmm-donnees-du-portail-dinformation-trouver-mon-master-parcours-de-format/download/?format=json&timezone=Europe/Berlin&lang=fr";

function escapeRegex(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * A single data entry from "trouver mon master" looks like :
 *
 * fields: {
 *   etab_uai: '0623957P',
 *   for_modalite: 'Formation initiale|Formation continue|Alternance',
 *   lieu_for: 'Faculté des Sciences Jean Perrin',
 *   for_intitule: 'Informatique',
 *   for_inm: '1502317D',
 *   parc_inmp: '1502317-15T',
 *   lieu_for_geo: [Array],
 *   parc_intitule: 'Ingénierie logicielle pour les jeux',
 *   lieu_for_ville: 'LENS',
 *   etab_ad: '9  RUE DU TEMPLE',
 *   lieu_for_cp: '62300',
 *   parc_ouvert: '1',
 *   parc_modalite: 'Formation initiale|Formation continue|Alternance',
 *   etab_nom: "Université d'Artois",
 *   etab_ville: 'ARRAS CEDEX',
 *   annee: '2020',
 *   etab_cp: '62030',
 *   lieu_for_ad: 'Rue Jean Souvraz',
 *   for_ouverte: '1'
 * }
 */
const run = async ({ mailer }) => {
  logger.info("-- Trouver mon master --");

  const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
  const to = ["eric.plaquevent@beta.gouv.fr"];

  const { data: linesLieux } = await axios.get(lieuxUrl);
  const { data: linesMentions } = await axios.get(mentionsUrl);
  const { data: linesParcours } = await axios.get(parcoursUrl);

  let description = "";
  description += `${linesLieux.length} lignes dans le fichier lieux de formation; \n`;
  description += `${linesMentions.length} lignes dans le fichier mentions; \n`;
  description += `${linesParcours.length} lignes dans le fichier parcours; \n\n`;

  logger.info(linesLieux.length, "lignes dans le fichier lieux de formation");
  logger.info(linesMentions.length, "lignes dans le fichier mentions");
  logger.info(linesParcours.length, "lignes dans le fichier parcours");

  // keep only unique values
  const getUniqueValues = (key) => {
    const lieuxSet = new Set(linesLieux.map((line) => line.fields[key]));
    const mentionsSet = new Set(linesMentions.map((line) => line.fields[key]));
    const parcoursSet = new Set(linesParcours.map((line) => line.fields[key]));

    const set = new Set([...lieuxSet, ...mentionsSet, ...parcoursSet]);
    return Array.from(set);
  };

  const uais = getUniqueValues("etab_uai");
  const uaiNotFound = [];

  await chunkedAsyncForEach(uais, async (uai) => {
    const found = await ConvertedFormation.exists({
      published: true,
      $or: [{ uai_formation: uai }, { etablissement_formateur_uai: uai }, { etablissement_gestionnaire_uai: uai }],
    });
    if (!found) {
      uaiNotFound.push(uai);
    }
  });

  description += `${uaiNotFound.length} UAIs non trouvés dans le catalogue, sur un total de ${uais.length} UAIs uniques dans les différents fichiers; \n`;

  logger.info(
    uaiNotFound.length,
    "UAIs non trouvés dans le catalogue, sur un total de",
    uais.length,
    "UAIs uniques dans les différents fichiers"
  );

  const attachments = [
    {
      filename: `uais-non-trouves-${date}.csv`,
      content: Buffer.from(["UAIs non trouvés", ...uaiNotFound].join("\n"), "latin1"),
      contentType: "text/csv",
    },
  ];

  const intitulesMention = getUniqueValues("for_intitule");
  const intitulesMentionNotFound = [];

  await chunkedAsyncForEach(intitulesMention, async (intitule) => {
    if (!intitule) {
      return;
    }

    const regex = new RegExp(`^${escapeRegex(intitule)}$`, "i");
    const found = await ConvertedFormation.exists({
      published: true,
      $or: [
        { intitule_long: { $regex: regex } },
        { intitule_court: { $regex: regex } },
        { rncp_intitule: { $regex: regex } },
      ],
    });
    if (!found) {
      intitulesMentionNotFound.push(intitule);
    } else {
      logger.info("found", intitule);
    }
  });

  description += `${intitulesMentionNotFound.length} intitulés de mentions non trouvés dans le catalogue, sur un total de ${intitulesMention.length} intitulés de mentions uniques dans les différents fichiers; \n`;

  logger.info(
    intitulesMentionNotFound.length,
    "intitulés de mentions non trouvés dans le catalogue, sur un total de",
    intitulesMention.length,
    "intitulés de mentions uniques dans les différents fichiers"
  );

  attachments.push({
    filename: `intitules-mention-non-trouves-${date}.csv`,
    content: Buffer.from(["Intitulés de mentions non trouvés", ...intitulesMentionNotFound].join("\n"), "latin1"),
    contentType: "text/csv",
  });

  const intitulesParcours = getUniqueValues("parc_intitule");
  const intitulesParcoursNotFound = [];

  await chunkedAsyncForEach(intitulesParcours, async (intitule) => {
    if (!intitule) {
      return;
    }

    const regex = new RegExp(`^${escapeRegex(intitule)}$`, "i");
    const found = await ConvertedFormation.exists({
      published: true,
      $or: [
        { intitule_long: { $regex: regex } },
        { intitule_court: { $regex: regex } },
        { rncp_intitule: { $regex: regex } },
      ],
    });
    if (!found) {
      intitulesParcoursNotFound.push(intitule);
    } else {
      logger.info("found", intitule);
    }
  });

  description += `${intitulesParcoursNotFound.length} intitulés de parcours non trouvés dans le catalogue, sur un total de ${intitulesParcours.length} intitulés de parcours uniques dans les différents fichiers; \n`;

  logger.info(
    intitulesParcoursNotFound.length,
    "intitulés de parcours non trouvés dans le catalogue, sur un total de",
    intitulesParcours.length,
    "intitulés de parcours uniques dans les différents fichiers"
  );

  attachments.push({
    filename: `intitules-parcours-non-trouves-${date}.csv`,
    content: Buffer.from(["Intitulés de parcours non trouvés", ...intitulesParcoursNotFound].join("\n"), "latin1"),
    contentType: "text/csv",
  });

  await mailer.sendEmail(
    to,
    `[${config.env} Catalogue apprentissage] Comparaison de données avec "Trouver Mon Master"`,
    path.join(__dirname, "../../../assets/templates/oneshot-jobs.mjml.ejs"),
    {
      title: 'Comparaison de données avec "Trouver Mon Master"',
      description,
    },
    attachments
  );
};

runScript(async ({ mailer }) => {
  await run({ mailer });
});
