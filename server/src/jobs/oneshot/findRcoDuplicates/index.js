const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { Formation } = require("../../../common/model");
const config = require("config");
const path = require("path");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { DateTime } = require("luxon");
const { uniq } = require("lodash");

/*
 * Some formations received from RCO have the same properties.
 * They should be merged on RCO side, so we export a file to notify RCO of these duplicates.
 * We call them duplicates if they share :
 * - cfd
 * - code_postal
 * - etablissement_formateur_siret
 * - etablissement_gestionnaire_siret
 * - published
 */

runScript(async ({ mailer }) => {
  logger.info(`Start find RCO duplicates`);

  const result = await Formation.aggregate([
    {
      $group: {
        _id: {
          cfd: "$cfd",
          code_postal: "$code_postal",
          etablissement_formateur_siret: "$etablissement_formateur_siret",
          etablissement_gestionnaire_siret: "$etablissement_gestionnaire_siret",
          published: "$published",
        },
        // duplicates: {
        //   $push: { id_formation: "$id_formation", id_action: "$id_action", id_certifinfo: "$id_certifinfo" },
        // },
        // id_rco_formation: {
        //   $push: { id_rco_formation: "$id_rco_formation" },
        // },
        id_formation: {
          $push: { id_formation: "$id_formation" },
        },
        id_action: {
          $push: { id_action: "$id_action" },
        },
        id_certifinfo: {
          $push: { id_certifinfo: "$id_certifinfo" },
        },
        nom_academie: {
          $push: { nom_academie: "$nom_academie" },
        },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gte: 2 }, "_id.cfd": { $ne: null }, "_id.published": true } },
    { $sort: { count: -1 } },
  ]);

  const headers = [
    "Nombre de doublons",
    "Académie",
    "cfd",
    "etablissement_lieu_formation_code_postal",
    "etablissement_formateur_siret",
    "etablissement_gestionnaire_siret",
    // "ids RCO",
    "ids formations",
    "ids actions",
    "ids certif info",
  ];

  const lines = [];
  await asyncForEach(result, async (entry) => {
    const row = [];

    row.push(entry.count);
    row.push(uniq(entry.nom_academie.map((e) => e.nom_academie)).join(","));
    row.push(`="${entry._id.cfd}"`);
    row.push(`="${entry._id.code_postal}"`);
    row.push(`="${entry._id.etablissement_formateur_siret}"`);
    row.push(`="${entry._id.etablissement_gestionnaire_siret}"`);
    // row.push(JSON.stringify(entry.id_rco_formation));
    row.push(JSON.stringify(entry.id_formation));
    row.push(JSON.stringify(entry.id_action));
    row.push(JSON.stringify(entry.id_certifinfo));

    const actualRow = row.join(";");
    lines.push(actualRow);
  });

  const data = [headers.join(";"), ...lines].join("\n");

  const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
  const attachments = [
    { filename: `rco-duplicates-${date}.csv`, content: Buffer.from(data, "latin1"), contentType: "text/csv" },
  ];
  const to = config.rco.reportMailingList.split(",");

  await mailer.sendEmail(
    to,
    `[${config.env} Catalogue apprentissage] Export des doublons de formations RCO`,
    path.join(__dirname, "../../../assets/templates/oneshot-jobs.mjml.ejs"),
    {
      title: "Doublons de formations RCO",
      description: `Il y a ${lines.length} formations RCO avec des doublons`,
    },
    attachments
  );

  logger.info(`End find RCO duplicates`);
});
