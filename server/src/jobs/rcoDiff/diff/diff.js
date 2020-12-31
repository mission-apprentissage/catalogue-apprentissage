const logger = require("../../../common/logger");
const { ConvertedFormation, MnaFormation } = require("../../../common/model/index");
const report = require("../../../logic/reporter/report");
const config = require("config");
const { storeByChunks } = require("../../common/utils/reportUtils");

const run = async () => {
  //  Make a diff report between Converted formation & Mna formation dbs
  const diffResult = await performDiff();

  //   Then create a report of diff
  await createDiffReport(diffResult);
};

const performDiff = async () => {
  // match MNA /RCO === siret + cfd + code postal + code insee + rncp_code + uai
  const matchingFormations = [];

  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await ConvertedFormation.paginate({}, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (convertedFormation) => {
        computed += 1;

        const matchings = await MnaFormation.find({
          cfd: convertedFormation.cfd,
          rncp_code: convertedFormation.rncp_code,
          code_commune_insee: convertedFormation.code_commune_insee,
          code_postal: convertedFormation.code_postal,
          etablissement_gestionnaire_siret: convertedFormation.etablissement_gestionnaire_siret,
          etablissement_gestionnaire_uai: convertedFormation.etablissement_gestionnaire_uai,
          etablissement_formateur_siret: convertedFormation.etablissement_formateur_siret,
          etablissement_formateur_uai: convertedFormation.etablissement_formateur_uai,
          lieu_formation_siret: convertedFormation.lieu_formation_siret,
          uai_formation: convertedFormation.uai_formation,
        });

        if (matchings.length > 0) {
          matchingFormations.push({
            id_rco_formation: convertedFormation.id_rco_formation,
            matchingsMna: matchings.map((m) => m._id),
          });
        }
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }

  return { matchingFormations, total: nbFormations };
};

const createDiffReport = async ({ matchingFormations, total }) => {
  logger.info("Diff report :", `${matchingFormations.length}/${total} matching formations`);

  const summary = {
    total,
    matchingCount: matchingFormations.length,
  };
  const data = { matchingFormations, summary };

  // save report in db
  const date = Date.now();
  const type = "rcoDiff";

  await storeByChunks(type, date, summary, "matchingFormations", matchingFormations);

  data.link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  const title = "[RCO Formations] Rapport différentiel avec la base MNA";
  const to = config.rco.reportMailingList.split(",");
  await report.generate(data, title, to, "rcoDiffReport");
};

module.exports = { run };
