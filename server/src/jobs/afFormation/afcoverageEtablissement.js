const { oleoduc, writeData, transformData } = require("oleoduc");
const { AfFormation } = require("../../common/model");
const logger = require("../../common/logger");
const { etablissement } = require("./mapper");
const { Readable } = require("stream");
const mongoose = require("mongoose");

module.exports = async (catalogue) => {
  logger.info(`--- START ETABLISSEMENT COVERAGE ---`);

  const getEtablissements = (query) => catalogue.getEtablissements({ query });

  await oleoduc(
    AfFormation.find({ matching_type: { $ne: null }, matching_mna_formation: { $eq: null } })
      .lean()
      .cursor(),
    transformData((formation) => {
      return { formations: formation.matching_mna_formation, id: formation._id };
    }),
    transformData(
      async ({ formations, id }) => {
        let etablissements = [];

        await oleoduc(
          Readable.from(formations),
          writeData(async ({ uai_formation, etablissement_formateur_uai, etablissement_gestionnaire_uai }) => {
            let exist = etablissements.find(
              (x) =>
                x.uai === uai_formation ||
                x.uai === etablissement_formateur_uai ||
                x.uai === etablissement_gestionnaire_uai
            );

            if (exist) return;

            if (uai_formation) {
              let resuai = await getEtablissements({ uai: uai_formation });

              if (resuai.length > 0) {
                resuai.forEach((x) => {
                  const formatted = etablissement(x);
                  etablissements.push({ ...formatted, matched_uai: "UAI_FORMATION" });
                });
              }
            }

            if (etablissement_formateur_uai) {
              let resformateur = await getEtablissements({ uai: etablissement_formateur_uai });

              if (resformateur.length > 0) {
                resformateur.forEach((x) => {
                  const formatted = etablissement(x);
                  etablissements.push({ ...formatted, matched_uai: "UAI_FORMATEUR" });
                });
              }
            }

            if (etablissement_gestionnaire_uai) {
              let resgestionnaire = await getEtablissements({ uai: etablissement_gestionnaire_uai });

              if (resgestionnaire.length > 0) {
                resgestionnaire.forEach((x) => {
                  const formatted = etablissement(x);
                  etablissements.push({ ...formatted, matched_uai: "UAI_GESTIONNAIRE" });
                });
              }
            }
          })
        );

        return { etablissements: etablissements, id: id };
      }
      // { parallel: 10 }
    ),
    writeData(async ({ etablissements, id }) => {
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

      logger.info(`${formatted.length} etablissement ajouté - id_formation : ${id}`);
      await AfFormation.findByIdAndUpdate(id, {
        matching_mna_etablissement: formatted,
      });
    })
  );
  logger.info(`--- END ETABLISSEMENT COVERAGE ---`);
};
