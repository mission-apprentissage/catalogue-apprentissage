const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { PendingRcoFormation, ConvertedFormation } = require("../../common/model");
const config = require("config");
const path = require("path");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { DateTime } = require("luxon");

if (process.env.standalone) {
  runScript(async ({ mailer }) => {
    logger.info(`Start pending formation export`);

    const to = config.rco.reportMailingList.split(",");

    const nbFormations = await PendingRcoFormation.countDocuments({});

    const projection = {
      _id: 1,
      id_rco_formation: 1,
      etablissement_gestionnaire_uai: 1,
      etablissement_formateur_uai: 1,
      etablissement_formateur_siret: 1,
      etablissement_gestionnaire_siret: 1,
      lieu_formation_siret: 1,
      uai_formation: 1,
      nom_academie: 1,
      num_academie: 1,
      lieu_formation_adresse: 1,
      code_postal: 1,
      cfd: 1,
      periode: 1,
      capacite: 1,
    };

    const formations = await PendingRcoFormation.find({}, projection);
    const computedHeaders = Object.keys(projection);

    const lines = [];
    await asyncForEach(formations, async (formation) => {
      const original = await ConvertedFormation.findById(formation._id);

      if (original) {
        const row = computedHeaders.map((header) => {
          if (
            [
              "uai_formation",
              "nom_academie",
              "num_academie",
              "lieu_formation_adresse",
              "code_postal",
              "cfd",
              "periode",
              "capacite",
            ].includes(header)
          ) {
            if (original[header] === formation[header] || (original[header] === null && !formation[header])) {
              return "";
            }

            return `${original[header]} / ${formation[header]}`;
          }

          return formation[header];
        });

        const actualRow = row.join(";");
        lines.push(actualRow);
      }
    });

    const data = [computedHeaders.join(";"), ...lines].join("\n");

    const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
    const attachments = [{ filename: `export-pending-formations-${date}.csv`, content: data, contentType: "text/csv" }];

    await mailer.sendEmail(
      to,
      `[${config.env} Catalogue apprentissage] Pending formations export`,
      path.join(__dirname, "../../assets/templates/pending-formations-export.mjml.ejs"),
      {
        nbFormations,
      },
      attachments
    );

    logger.info(`End pending formation export`);
  });
}
