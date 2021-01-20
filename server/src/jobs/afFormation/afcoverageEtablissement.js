const { asyncForEach } = require("../../common/utils/asyncUtils");
const { AfFormation } = require("../../common/model");
const mongoose = require("mongoose");
const logger = require("../../common/logger");
const { etablissement } = require("./mapper");

module.exports = async (catalogue) => {
  logger.info("Get parcoursup formations...");
  const afFormation = await AfFormation.find({ matching_type: { $ne: null } }).lean();

  logger.info("Get catalogue establishements...");
  const baseEtablissement = await catalogue.getEtablissements();

  logger.info(`${afFormation.length} formation à traiter`);
  await asyncForEach(afFormation, async (formation, index) => {
    logger.info(
      `Formation ${index + 1}/${afFormation.length} - ${formation.libelle_uai_affilie} — mef : ${formation.code_mef_10}`
    );
    let etablissements = [];

    await asyncForEach(formation.matching_mna_formation, async (matches, index) => {
      logger.info(
        `Processing ${index + 1} of ${formation.matching_mna_formation.length} matching - cfd : ${matches.cfd}`
      );

      if (matches.uai_formation) {
        let resuai = baseEtablissement.filter((x) => x.uai === matches.uai_formation);

        if (resuai.length > 0) {
          logger.info(`Found ${resuai.length} matches with UAI_FORMATION`);
          resuai.forEach((x) => {
            const formatted = etablissement(x);
            etablissements.push({ ...formatted, matched_uai: "UAI_FORMATION" });
          });
        }
      }

      if (matches.etablissement_formateur_uai) {
        let resformateur = baseEtablissement.filter((x) => x.uai === matches.etablissement_formateur_uai);

        if (resformateur.length > 0) {
          logger.info(`Found ${resformateur.length} matches with UAI_FORMATEUR`);
          resformateur.forEach((x) => {
            const formatted = etablissement(x);
            etablissements.push({ ...formatted, matched_uai: "UAI_FORMATEUR" });
          });
        }
      }

      if (matches.etablissement_gestionnaire_uai) {
        let resgestionnaire = baseEtablissement.filter((x) => x.uai === matches.etablissement_gestionnaire_uai);

        if (resgestionnaire.length > 0) {
          logger.info(`Found ${resgestionnaire.length} matches with UAI_GESTIONNAIRE`);
          resgestionnaire.forEach((x) => {
            const formatted = etablissement(x);
            etablissements.push({ ...formatted, matched_uai: "UAI_GESTIONNAIRE" });
          });
        }
      }
    });

    if (etablissements.length === 0) return;

    const result = etablissements.reduce((acc, item) => {
      if (!acc[item._id]) {
        acc[item._id] = item;
        acc[item._id].matched_uai = [acc[item._id].matched_uai];
      } else {
        const exist = acc[item._id].matched_uai.includes(item.matched_uai);
        if (acc[item._id].matched_uai !== item.matched_uai) {
          if (!exist) {
            acc[item._id].matched_uai = acc[item._id].matched_uai.concat([item.matched_uai]);
          }
        }
      }
      return acc;
    }, {});

    const formatted = Object.values(result).map((x) => {
      return {
        _id: mongoose.Types.ObjectId(),
        ...x,
      };
    });

    logger.info(`${formatted.length} etablissement ajouté - id_formation : ${formation._id}`);
    await AfFormation.findByIdAndUpdate(formation._id, {
      matching_mna_etablissement: formatted,
    });
  });
};
