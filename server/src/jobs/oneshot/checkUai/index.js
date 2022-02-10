const { isValideUAI } = require("@mission-apprentissage/tco-service-node");
// const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const config = require("config");
const path = require("path");
const { DateTime } = require("luxon");
const { Etablissement, Formation } = require("../../../common/model");

const updateUaiValidity = async (collection, uaiField, uaiValidityField) => {
  console.info(`Checking for UAI in collection...`);
  const cursor = await collection.find({}).cursor();
  let count = 0;

  for await (const entry of cursor) {
    const valid = !entry[uaiField] || (await isValideUAI(entry[uaiField]));
    !valid && console.log(`❌ ${entry[uaiField]}`);
    !valid && count++;

    await collection.updateOne(
      { _id: entry._id },
      {
        $set: {
          [uaiValidityField]: valid,
        },
      }
    );
  }
  console.info(`${count} UAI not valid !`);
  console.info(`Checking for UAI in collection: 🆗`);
};

const generateCsvData = (entries, columns) => {
  console.info(`Generating CSV data for invalid UAI...`);
  const headers = Object.keys(columns);

  const lines = entries.map((entry) => {
    const row = Object.values(columns).map((value) => value(entry));
    return row.join(";");
  });

  const data = [headers.join(";"), ...lines].join("\n");
  console.info(`Generating CSV data for invalid UAI: 🆗`);
  return data;
};

runScript(async ({ mailer }) => {
  try {
    const etablissementCsvData = await (async () => {
      await updateUaiValidity(Etablissement, "uai", "uai_valide");

      return generateCsvData(await Etablissement.find({ uai_valide: false }), {
        "UAI invalide": (etablissement) => etablissement.uai,
        SIRET: (etablissement) => etablissement.siret,
        Académie: (etablissement) => etablissement.nom_academie,
      });
    })();

    const formationCsvData = await (async () => {
      await updateUaiValidity(Formation, "uai_formation", "uai_formation_valide");

      return generateCsvData(await Formation.find({ uai_formation_valide: false }), {
        "UAI invalide": (formation) => formation.uai_formation,
        "Clé ministère éducatif": (formation) => formation.cle_ministere_educatif,
        Académie: (formation) => formation.nom_academie,
      });
    })();

    const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
    const attachments = [
      {
        filename: `etablissement_invalid_uai-${date}.csv`,
        content: Buffer.from(etablissementCsvData, "latin1"),
        contentType: "text/csv",
      },
      {
        filename: `formation_invalid_uai-${date}.csv`,
        content: Buffer.from(formationCsvData, "latin1"),
        contentType: "text/csv",
      },
    ];
    const to = config.rco.reportMailingList.split(",");

    console.info(`Sending mail with csv as attachments to ${to}...`);

    await mailer.sendEmail(
      to,
      `[${config.env} Catalogue apprentissage] Export des codes UAI invalides`,
      path.join(__dirname, "../../../assets/templates/oneshot-jobs.mjml.ejs"),
      {
        title: "Code UAI invalides",
        description: `Un check sur la validité des UAI en base a remonté les erreurs suivantes (voir fichiers CSV).`,
      },
      attachments
    );

    console.info(`Sending mail: 🆗`);
  } catch (error) {
    console.error(error);
  }
});
