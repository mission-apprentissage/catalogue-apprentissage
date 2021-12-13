const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { PendingRcoFormation, Formation } = require("../../common/model");
const config = require("config");
const path = require("path");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { DateTime } = require("luxon");

if (process.env.standalone) {
  runScript(async ({ mailer }) => {
    logger.info(`Start pending formation export`);

    const to = config.reportMailingList.split(",");

    const projection = {
      _id: 1,
      etablissement_gestionnaire_uai: 1,
      etablissement_formateur_uai: 1,
      etablissement_formateur_siret: 1,
      etablissement_gestionnaire_siret: 1,
      lieu_formation_adresse: 1,
      code_postal: 1,
      code_commune_insee: 1,
      cfd: 1,
      published: 1,
      cle_ministere_educatif: 1,
    };

    const formations = await PendingRcoFormation.find({}, projection);
    const computedHeaders = Object.keys(projection);

    const lines = [];
    const deletableLines = [];
    await asyncForEach(formations, async (formation) => {
      const original = await Formation.findById(formation._id);

      if (original) {
        let hasOneChange = false;
        const row = computedHeaders.map((header) => {
          if (["lieu_formation_adresse", "code_postal", "code_commune_insee", "published"].includes(header)) {
            if (original[header] === formation[header] || (original[header] === null && !formation[header])) {
              return "";
            }
            hasOneChange = true;
            return `${original[header]} / ${formation[header]}`;
          }

          if ("cle_ministere_educatif" === header) {
            return original[header];
          }

          return formation[header];
        });

        if (original.published === false && formation.published) {
          deletableLines.push(formation._id);
          console.log(`not published anymore, can delete pending : ${formation._id}`);
          return;
        }
        if (!hasOneChange) {
          deletableLines.push(formation._id);
          console.log(`no differences can delete pending: ${formation._id}`);
          return;
        }
        const actualRow = row.join(";");
        lines.push(actualRow);
      } else {
        deletableLines.push(formation._id);
        console.log(`no corresponding converted formation, can delete pending : ${formation._id}`);
      }
    });

    console.log(`can delete ${deletableLines.length} pending`);
    await PendingRcoFormation.deleteMany({ _id: { $in: deletableLines } });

    const data = [computedHeaders.join(";"), ...lines].join("\n");

    const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
    const attachments = [{ filename: `export-pending-formations-${date}.csv`, content: data, contentType: "text/csv" }];

    await mailer.sendEmail(
      to,
      `[${config.env} Catalogue apprentissage] Pending formations export`,
      path.join(__dirname, "../../assets/templates/pending-formations-export.mjml.ejs"),
      {
        nbFormations: lines.length,
      },
      attachments
    );

    logger.info(`End pending formation export`);
  });
}
