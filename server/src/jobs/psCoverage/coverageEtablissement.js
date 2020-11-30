const { asyncForEach } = require("../../common/utils/asyncUtils");
const { PsFormation } = require("../../common/model");
const logger = require("../../common/logger");

module.exports = async (catalogue) => {
  const psFormation = await PsFormation.find({ matching_type: { $ne: null } }).lean();
  logger.info(`${psFormation.length} formation à traiter`);

  await asyncForEach(psFormation, async (formation) => {
    logger.info(`Processing ${formation.libelle_uai_affilie} — mef : ${formation.code_mef_10}`);
    let etablissements = [];

    // TODO ? filter matching_mna_formation to avoid duplicate calls/entries
    // const filter = formation.matching_mna_formation.reduce((acc, formation) => {});

    await asyncForEach(formation.matching_mna_formation, async (matches, index) => {
      logger.info(`Processing ${index + 1} of ${formation.matching_mna_formation.length} - cfd : ${matches.cfd}`);

      // console.log({
      //   "UAI FORMATION": matches.uai_formation,
      //   "UAI GESTIONNAIRE": matches.etablissement_gestionnaire_uai,
      //   "UAI FORMATEUR": matches.etablissement_formateur_uai,
      // });

      if (matches.uai_formation) {
        let resuai = await catalogue.getEtablissements({ query: { uai: matches.uai_formation } });
        if (resuai.length > 0) {
          logger.info(`Found ${resuai.length} matches with UAI_FORMATION`);
          etablissements.push({ data: resuai, matched_uai: "UAI_FORMATION" });
        }
      }

      if (matches.etablissement_formateur_uai) {
        let resformateur = await catalogue.getEtablissements({ query: { uai: matches.etablissement_formateur_uai } });

        if (resformateur.length > 0) {
          logger.info(`Found ${resformateur.length} matches with UAI_FORMATEUR`);
          etablissements.push({ data: resformateur, matched_uai: "UAI_FORMATEUR" });
        }
      }

      if (matches.etablissement_gestionnaire_uai) {
        let resgestionnaire = await catalogue.getEtablissements({
          query: { uai: matches.etablissement_gestionnaire_uai },
        });

        if (resgestionnaire.length > 0) {
          logger.info(`Found ${resgestionnaire.length} matches with UAI_GESTIONNAIRE`);
          etablissements.push({ data: resgestionnaire, matched_uai: "UAI_GESTIONNAIRE" });
        }
      }
    });

    if (etablissements.length === 0) return;

    await PsFormation.findByIdAndUpdate(formation._id, {
      matching_mna_etablissement: etablissements,
    });
  });
};
