const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { RcoFormation } = require("../../../common/model");
const config = require("config");
const path = require("path");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { DateTime } = require("luxon");

/*
 * Some formations received from RCO have the same properties.
 * They should be merged on RCO side, so we export a file to notify RCO of these duplicates.
 * We call them duplicates if they share :
 * - cfd
 * - etablissement_lieu_formation_code_postal
 * - etablissement_formateur_siret
 * - etablissement_gestionnaire_siret
 * - published
 */

runScript(async ({ mailer }) => {
  logger.info(`Start find RCO duplicates`);

  const result = await RcoFormation.aggregate([
    {
      $group: {
        _id: {
          cfd: "$cfd",
          etablissement_lieu_formation_code_postal: "$etablissement_lieu_formation_code_postal",
          etablissement_formateur_siret: "$etablissement_formateur_siret",
          etablissement_gestionnaire_siret: "$etablissement_gestionnaire_siret",
          published: "$published",
        },
        duplicates: {
          $push: { id_formation: "$id_formation", id_action: "$id_action", id_certifinfo: "$id_certifinfo" },
        },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gte: 2 }, "_id.cfd": { $ne: null }, "_id.published": true } },
    { $sort: { count: -1 } },
  ]);

  const headers = [
    "duplicates count",
    "cfd",
    "etablissement_lieu_formation_code_postal",
    "etablissement_formateur_siret",
    "etablissement_gestionnaire_siret",
    "ids rco",
  ];

  const lines = [];
  await asyncForEach(result, async (entry) => {
    const row = [];

    row.push(entry.count);
    row.push(entry._id.cfd);
    row.push(entry._id.etablissement_lieu_formation_code_postal);
    row.push(entry._id.etablissement_formateur_siret);
    row.push(entry._id.etablissement_gestionnaire_siret);
    row.push(JSON.stringify(entry.duplicates));

    const actualRow = row.join(";");
    lines.push(actualRow);
  });

  const data = [headers.join(";"), ...lines].join("\n");

  const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
  const attachments = [{ filename: `rco-duplicates-${date}.csv`, content: data, contentType: "text/csv" }];
  const to = config.rco.reportMailingList.split(",");

  await mailer.sendEmail(
    to,
    `[${config.env} Catalogue apprentissage] Export des doublons de formations RCO`,
    path.join(__dirname, "../../../assets/templates/rco-duplicates-export.mjml.ejs"),
    {
      nbFormations: lines.length,
    },
    attachments
  );

  logger.info(`End find RCO duplicates`);
});
