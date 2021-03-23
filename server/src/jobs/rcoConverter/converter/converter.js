const logger = require("../../../common/logger");
const { RcoFormation, ConvertedFormation } = require("../../../common/model/index");
const { mnaFormationUpdater } = require("../../../logic/updaters/mnaFormationUpdater");
const report = require("../../../logic/reporter/report");
const config = require("config");
const { createOrUpdateEtablissements } = require("../../../logic/updaters/etablissementUpdater");

const { paginator } = require("../../common/utils/paginator");
const { storeByChunks } = require("../../common/utils/reportUtils");

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
    rco_published: rcoFormation.published,

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

  await paginator(RcoFormation, { filter: { converted_to_mna: { $ne: true } }, limit: 10 }, async (rcoFormation) => {
    const mnaFormattedRcoFormation = formatToMnaFormation(rcoFormation._doc);

    if (!rcoFormation.published) {
      // if formation is unpublished, don't create etablissement and don't call mnaUpdater
      // since we don't care of errors we just want to hide the formation
      rcoFormation.conversion_error = "success";
      await rcoFormation.save();

      await ConvertedFormation.findOneAndUpdate(
        { id_rco_formation: mnaFormattedRcoFormation.id_rco_formation },
        { published: false, rco_published: false },
        {
          new: true,
        }
      );

      convertedRcoFormations.push({
        id_rco_formation: mnaFormattedRcoFormation.id_rco_formation,
        cfd: mnaFormattedRcoFormation.cfd,
        updates: JSON.stringify({ published: false }),
      });
      return;
    }

    await createOrUpdateEtablissements(rcoFormation._doc);

    const { updates, formation: convertedFormation, error, serviceAvailable = true } = await mnaFormationUpdater(
      mnaFormattedRcoFormation,
      {
        withHistoryUpdate: false,
      }
    );

    if (error) {
      rcoFormation.conversion_error = error;
      await rcoFormation.save();

      if (serviceAvailable) {
        // unpublish in case of errors if it was already in converted collection
        // but don't do it if service tco is unavailable
        await ConvertedFormation.findOneAndUpdate(
          { id_rco_formation: mnaFormattedRcoFormation.id_rco_formation },
          { published: false, update_error: error },
          {
            new: true,
          }
        );
      }

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

    rcoFormation.conversion_error = "success";
    await rcoFormation.save();

    const previousFormation = await ConvertedFormation.findOne({
      id_rco_formation: convertedFormation.id_rco_formation,
    }).lean();
    if (previousFormation) {
      // Keep Affelnet & Parcoursup related data (to prevent override user modifications)
      convertedFormation.affelnet_reference = previousFormation.affelnet_reference;
      convertedFormation.affelnet_statut = previousFormation.affelnet_statut;
      convertedFormation.affelnet_error = previousFormation.affelnet_error;
      convertedFormation.parcoursup_reference = previousFormation.parcoursup_reference;
      convertedFormation.parcoursup_statut = previousFormation.parcoursup_statut;
      convertedFormation.parcoursup_error = previousFormation.parcoursup_error;
      convertedFormation.affelnet_infos_offre = previousFormation.affelnet_infos_offre;
    }

    // replace or insert new one
    await ConvertedFormation.findOneAndUpdate(
      { id_rco_formation: convertedFormation.id_rco_formation },
      convertedFormation,
      {
        overwrite: true,
        upsert: true,
        new: true,
      }
    );

    convertedRcoFormations.push({
      id_rco_formation: convertedFormation.id_rco_formation,
      cfd: convertedFormation.cfd,
      updates: JSON.stringify(updates),
    });
  });

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

  await storeByChunks(type, date, summary, "converted", convertedRcoFormations);
  await storeByChunks(`${type}.error`, date, summary, "errors", invalidRcoFormations);

  const link = `${config.publicUrl}/report?type=${type}&date=${date}`;
  const data = { invalid: invalidRcoFormations, converted: convertedRcoFormations, summary, link };

  // Send mail
  const title = "[RCO Formations] Rapport de conversion";
  const to = config.rco.reportMailingList.split(",");
  await report.generate(data, title, to, "rcoConversionReport");
};

module.exports = { run, performConversion };
