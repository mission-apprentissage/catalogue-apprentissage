const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { RcoFormation, ConvertedFormation } = require("../../../common/model");
const config = require("config");
const path = require("path");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { DateTime } = require("luxon");

runScript(async ({ mailer }) => {
  const args = process.argv.slice(2);
  const rcoOnly = args?.[0] === "--rcoOnly";

  logger.info(`Start zip codes gap search`);

  const to = config.rco.reportMailingList.split(",");
  let headers = [];
  const lines = [];

  if (rcoOnly) {
    headers = [
      "id_formation",
      "id_action",
      "id_certifinfo",
      "etablissement_lieu_formation_code_insee",
      "etablissement_lieu_formation_code_postal",
    ];

    const rcoFormations = await RcoFormation.find({
      published: true,
      $where: function () {
        let dept = `${this.etablissement_lieu_formation_code_insee}`.substring(0, 2);
        dept = ["2A", "2B"].includes(dept) ? "20" : dept;
        return !this.etablissement_lieu_formation_code_postal.startsWith(dept);
      },
    });

    await asyncForEach(rcoFormations, async (formation) => {
      const row = [];
      row.push(formation.id_formation);
      row.push(formation.id_action);
      row.push(formation.id_certifinfo);
      row.push(`="${formation.etablissement_lieu_formation_code_insee}"`);
      row.push(`="${formation.etablissement_lieu_formation_code_postal}"`);
      const actualRow = row.join(";");
      lines.push(actualRow);
    });
  } else {
    const formations = await RcoFormation.find(
      { published: true },
      {
        id_formation: 1,
        id_action: 1,
        id_certifinfo: 1,
        etablissement_lieu_formation_code_postal: 1,
        etablissement_lieu_formation_code_insee: 1,
      }
    );

    const projection = { _id: 1, id_rco_formation: 1, code_commune_insee: 1, code_postal: 1 };

    headers = [
      "id mna",
      "id_formation",
      "id_action",
      "id_certifinfo",
      "code_commune_insee",
      "code_postal",
      "original code postal",
    ];

    await asyncForEach(formations, async (formation) => {
      const converted = await ConvertedFormation.findOne(
        {
          id_rco_formation: `${formation.id_formation}|${formation.id_action}|${formation.id_certifinfo}`,
        },
        projection
      );

      if (converted) {
        const dept = `${formation.etablissement_lieu_formation_code_postal}`.substring(0, 2);
        if (!converted.code_commune_insee?.startsWith(dept) && !converted.code_postal?.startsWith(dept)) {
          const row = [];
          row.push(converted._id);
          row.push(formation.id_formation);
          row.push(formation.id_action);
          row.push(formation.id_certifinfo);
          row.push(`="${converted.code_commune_insee}"`);
          row.push(`="${converted.code_postal}"`);
          row.push(formation.etablissement_lieu_formation_code_postal);
          const actualRow = row.join(";");
          lines.push(actualRow);
        }
      }
    });
  }

  const data = [headers.join(";"), ...lines].join("\n");

  const date = DateTime.local().setLocale("fr").toFormat("yyyy-MM-dd");
  const attachments = [{ filename: `zip-codes-gap-${date}.csv`, content: data, contentType: "text/csv" }];

  await mailer.sendEmail(
    to,
    `[${config.env} Catalogue apprentissage] Zip codes gap export`,
    path.join(__dirname, "../../../assets/templates/zip-codes-gap-export.mjml.ejs"),
    {
      nbFormations: lines.length,
    },
    attachments
  );

  logger.info(`End zip codes gap search`);
});
