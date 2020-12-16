const logger = require("../../../common/logger");
const { RcoFormation, ConvertedFormation, Report } = require("../../../common/model/index");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const report = require("../../../logic/reporter/report");
const config = require("config");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { chunk } = require("lodash");
const catalogue = require("../../../common/components/catalogue_old");

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

const getEtablissementData = (rcoFormation, prefix) => {
  return {
    siret: rcoFormation[`${prefix}_siret`] || null,
    uai: rcoFormation[`${prefix}_uai`] || null,
    geo_coordonnees: rcoFormation[`${prefix}_geo_coordonnees`] || null,
    ...getRCOEtablissementFields(rcoFormation, prefix),
  };
};

const getRCOEtablissementFields = (rcoFormation, prefix) => {
  return {
    rco_uai: rcoFormation[`${prefix}_uai`] || null,
    rco_geo_coordonnees: rcoFormation[`${prefix}_geo_coordonnees`] || null,
    rco_code_postal: rcoFormation[`${prefix}_code_postal`] || null,
    rco_adresse: rcoFormation[`${prefix}_adresse`] || null,
    rco_code_insee_localite: rcoFormation[`${prefix}_code_insee`] || null,
  };
};

const areEtablissementFieldsEqual = (rcoFields, etablissement) => {
  const keyMap = {
    rco_uai: "uai",
    rco_geo_coordonnees: "geo_coordonnees",
    rco_code_postal: "code_postal",
    rco_adresse: "adresse",
    rco_code_insee_localite: "code_insee_localite",
  };
  return Object.entries(rcoFields).every(([key, value]) => etablissement[keyMap[key]] === value);
};

const areRCOFieldsEqual = (rcoFields, etablissement) => {
  return Object.entries(rcoFields).every(([key, value]) => etablissement[key] === value);
};

const handledSirets = [];

/**
 * Create or update etablissements
 */
const createOrUpdateEtablissements = async (rcoFormation) => {
  const etablissementTypes = [
    "etablissement_gestionnaire",
    "etablissement_formateur" /*, "etablissement_lieu_formation"*/,
  ];

  await asyncForEach(etablissementTypes, async (type) => {
    const data = getEtablissementData(rcoFormation, type);
    if (!data.siret || handledSirets.includes(data.siret)) {
      return;
    }

    const years = ["2020", "2021"];
    const tags = years.filter((year) => rcoFormation.periode?.some((p) => p.includes(year)));
    if (tags.length === 0) {
      return;
    }

    handledSirets.push(data.siret);
    let etablissement = await catalogue().getEtablissement({ siret: data.siret });
    if (!etablissement?._id) {
      await catalogue().createEtablissement({ ...data, tags });
    } else {
      let updates = {};
      const rcoFields = getRCOEtablissementFields(rcoFormation, type);

      if (!areEtablissementFieldsEqual(rcoFields, etablissement) && !areRCOFieldsEqual(rcoFields, etablissement)) {
        updates = {
          ...updates,
          ...rcoFields,
        };
      }

      const tagsToAdd = tags.filter((tag) => !etablissement?.tags?.includes(tag));
      if (tagsToAdd.length > 0) {
        updates.tags = [...etablissement.tags, ...tagsToAdd];
      }

      if (Object.keys(updates).length > 0) {
        await catalogue().updateEtablissement(etablissement._id, updates);
      }
    }
  });
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

        await createOrUpdateEtablissements(rcoFormation._doc);

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
            rncp: mnaFormattedRcoFormation.rncp_code,
            sirets: JSON.stringify({
              gestionnaire: mnaFormattedRcoFormation.etablissement_gestionnaire_siret,
              formateur: mnaFormattedRcoFormation.etablissement_formateur_siret,
              lieu_formation: mnaFormattedRcoFormation.lieu_formation_siret,
            }),
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
  // save report in db
  const date = Date.now();
  const type = "rcoConversion";

  // Store by chunks to stay below the Mongo document max size (16Mb)
  const chunks = chunk(convertedRcoFormations, 2000);
  await asyncForEach(chunks, async (chunk) => {
    await new Report({
      type,
      date,
      data: { summary, converted: chunk },
    }).save();
  });

  await new Report({
    type: `${type}.error`,
    date,
    data: {
      errors: invalidRcoFormations,
    },
  }).save();

  const link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  const data = { invalid: invalidRcoFormations, converted: convertedRcoFormations, summary, link };

  // Send mail
  const title = "[RCO Formations] Rapport de conversion";
  const to = config.rco.reportMailingList.split(",");
  await report.generate(data, title, to, "rcoConversionReport");
};

// TODO @EPT
//  5 : upsert the successful ones in Mna DB --> flag 2021 (others should be flagged 2020)
//  6 : then create a report of import (update of a 2020 formation or creation of a new one)

module.exports = { run, performConversion };
