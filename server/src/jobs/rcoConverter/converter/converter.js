const logger = require("../../../common/logger");
const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const report = require("../../../logic/reporter/report");
const config = require("config");

const formatToMnaFormation = (rcoFormation) => {
  const periode =
    rcoFormation.periode && rcoFormation.periode.length > 0
      ? `[${rcoFormation.periode.reduce((acc, e) => `${acc}${acc ? ", " : ""}"${e}"`, "")}]`
      : null;

  return {
    id_rco_formation: `${rcoFormation.id_formation}|${rcoFormation.id_action}|${rcoFormation.id_certifinfo}`,
    cfd: rcoFormation.cfd,

    uai_formation: rcoFormation.etablissement_lieu_formation_uai,
    code_postal: rcoFormation.etablissement_lieu_formation_code_postal,
    code_commune_insee: rcoFormation.etablissement_lieu_formation_code_insee,

    lieu_formation_geo_coordonnees: rcoFormation.etablissement_lieu_formation_geo_coordonnees,
    lieu_formation_adresse: rcoFormation.etablissement_lieu_formation_adresse,
    lieu_formation_siret: rcoFormation.etablissement_lieu_formation_siret,

    rncp_code: rcoFormation.rncp_code,
    periode,
    capacite: rcoFormation.capacite,

    email: rcoFormation.email,
    source: "WS RCO",
    published: rcoFormation.published,

    etablissement_gestionnaire_siret: rcoFormation.etablissement_gestionnaire_siret,
    etablissement_gestionnaire_uai: rcoFormation.etablissement_gestionnaire_uai,
    etablissement_gestionnaire_adresse: rcoFormation.etablissement_gestionnaire_adresse,
    etablissement_gestionnaire_code_postal: rcoFormation.etablissement_gestionnaire_code_postal,
    etablissement_gestionnaire_code_commune_insee: rcoFormation.etablissement_gestionnaire_code_insee,
    geo_coordonnees_etablissement_gestionnaire: rcoFormation.etablissement_gestionnaire_geo_coordonnees,

    etablissement_formateur_siret: rcoFormation.etablissement_formateur_siret,
    etablissement_formateur_uai: rcoFormation.etablissement_formateur_uai,
    etablissement_formateur_adresse: rcoFormation.etablissement_formateur_adresse,
    etablissement_formateur_code_postal: rcoFormation.etablissement_formateur_code_postal,
    etablissement_formateur_code_commune_insee: rcoFormation.etablissement_formateur_code_insee,
    geo_coordonnees_etablissement_formateur: rcoFormation.etablissement_formateur_geo_coordonnees,
  };
};

const run = async () => {
  //  1 : filter rco formations which are not converted yet
  //  2 : convert them to mna format & launch updater on them
  const result = await performConversion();

  //  3 : Then create a report of conversion
  await createConversionReport(result);
};

const performConversion = async () => {
  const invalidRcoFormations = [];
  const convertedRcoFormations = [];

  let offset = 0;
  let limit = 100;
  let computed = 0;
  let nbFormations = 10;

  while (computed < nbFormations) {
    let { docs, total } = await RcoFormation.paginate({ converted_to_mna: { $ne: true } }, { offset, limit });
    nbFormations = total;

    await Promise.all(
      docs.map(async (rcoFormation) => {
        computed += 1;
        const mnaFormattedRcoFormation = formatToMnaFormation(rcoFormation._doc);

        const { updates, formation: convertedFormation, error } = await mnaFormationUpdater(mnaFormattedRcoFormation, {
          withHistoryUpdate: false,
        });

        if (error) {
          logger.error(
            `RcoFormation ${mnaFormattedRcoFormation.id_rco_formation}/${mnaFormattedRcoFormation.cfd} has error`,
            error
          );
          rcoFormation.conversion_error = error;
          await rcoFormation.save();
          invalidRcoFormations.push({
            id_rco_formation: mnaFormattedRcoFormation.id_rco_formation,
            cfd: mnaFormattedRcoFormation.cfd,
            error,
          });
          return;
        }

        logger.info(`RcoFormation ${convertedFormation.id_rco_formation} has been converted`);
        rcoFormation.conversion_error = "success";
        await rcoFormation.save();

        // replace or insert new one
        await ConvertedFormation.replaceOne(
          { id_rco_formation: convertedFormation.id_rco_formation },
          convertedFormation,
          {
            upsert: true,
          }
        );

        convertedRcoFormations.push({
          id_rco_formation: convertedFormation.id_rco_formation,
          cfd: convertedFormation.cfd,
          updates: JSON.stringify(updates),
        });
      })
    );

    offset += limit;

    logger.info(`progress ${computed}/${total}`);
  }

  // update converted_to_mna outside loop to not mess up with paginate
  await RcoFormation.updateMany(
    { conversion_error: "success" },
    { $set: { conversion_error: null, converted_to_mna: true } }
  );

  return { invalidRcoFormations, convertedRcoFormations };
};

const createConversionReport = async ({ invalidRcoFormations, convertedRcoFormations }) => {
  logger.info(
    "create report :",
    `${invalidRcoFormations.length} invalid formations,`,
    `${convertedRcoFormations.length} converted formations`
  );

  const summary = {
    invalidCount: invalidRcoFormations.length,
    convertedCount: convertedRcoFormations.length,
  };
  const data = { invalid: invalidRcoFormations, converted: convertedRcoFormations, summary };
  const title = "[RCO Formations] Rapport de conversion";
  const to = config.rco.reportMailingList.split(",");
  await report.generate(data, title, to, "rcoConversionReport");
};

// TODO @EPT
//  5 : upsert the successful ones in Mna DB --> flag 2021 (others should be flagged 2020)
//  6 : then create a report of import (update of a 2020 formation or creation of a new one)

module.exports = { run, performConversion };
