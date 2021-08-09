const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { ConvertedFormation } = require("../../../common/model");
const { DateTime } = require("luxon");
const config = require("config");
const path = require("path");

runScript(async ({ mailer }) => {
  logger.info(`Start check RCO data`);

  const totalFormationsMna = await ConvertedFormation.countDocuments({ published: true });

  const min_distance = 5000; // metres
  const pool = await ConvertedFormation.find(
    {
      published: true,
      distance_lieu_formation_etablissement_formateur: { $exists: true, $gt: min_distance },
    },
    {
      id_rco_formation: 1,
      lieu_formation_geo_coordonnees: 1,
      geo_coordonnees_etablissement_formateur: 1,
      distance_lieu_formation_etablissement_formateur: 1,
    }
  ).lean();

  const description = `Total geoloc lieu de formation vs etablissement formateur éloignées de plus de ${min_distance}m : ${
    pool.length
  } (${((pool.length / totalFormationsMna) * 100).toFixed(2)}%)`;

  logger.info(description);

  const headers = [
    "id RCO",
    "Lien fiche catalogue",
    "Distance lieu de formation et établissement formateur (en km)",
    "Geoloc lieu de formation",
    "Geoloc établissement formateur",
  ];

  const lines = pool.map((formation) => {
    const row = [];

    row.push(formation.id_rco_formation);
    row.push(`${config.publicUrl}/formation/${formation._id}`);
    row.push((formation.distance_lieu_formation_etablissement_formateur / 1000).toFixed(2));
    row.push(`https://www.google.fr/maps/@${formation.lieu_formation_geo_coordonnees},14z`);
    row.push(`https://www.google.fr/maps/@${formation.geo_coordonnees_etablissement_formateur},14z`);

    return row.join(";");
  });

  const data = [headers.join(";"), ...lines].join("\n");

  const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
  const attachments = [
    {
      filename: `distance-gap-geoloc-lieu-formation-formateur-${date}.csv`,
      content: Buffer.from(data, "latin1"),
      contentType: "text/csv",
    },
  ];
  const to = config.rco.reportMailingList.split(",");

  await mailer.sendEmail(
    to,
    `[${config.env} Catalogue apprentissage] Écarts de distances: lieu de formation vs établissement formateur`,
    path.join(__dirname, "../../../assets/templates/oneshot-jobs.mjml.ejs"),
    {
      title: "Écarts de distances: lieu de formation vs établissement formateur",
      description,
    },
    attachments
  );
});
