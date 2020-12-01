const { asyncForEach } = require("../../common/utils/asyncUtils");
const { PsCoverage } = require("../../common/model");
const { createXlsx, writeXlsxFile } = require("../../common/utils/fileUtils");
const logger = require("../../common/logger");

module.exports = async (catalogue) => {
  const matchingType = "3";
  const match = await PsCoverage.find({ matching_type: matchingType }).lean();
  logger.info(`${match.length} formation à traiter`);

  let buffer = {};
  let formatted = [];

  await asyncForEach(match, async (item, index) => {
    const formation = item.matching_mna_formation[0];
    logger.info(`${""} formation à traiter ${index}/${match.length}`);

    buffer.formation = { ...item };
    buffer.formation._id = buffer.formation._id.toString();
    delete buffer.formation.matching_mna_formation;
    delete buffer.formation.__v;
    buffer.etablissement = [];

    if (formation.uai_formation > 0) {
      let resuai = await catalogue.getEtablissements({ query: { uai: formation.uai_formation } });

      if (resuai.length > 0) {
        logger.info("getEtablissements by UAI");
        buffer.etablissement.push({ data: resuai, matched_uai: "UAI_FORMATION" });
      }
    }

    if (formation.etablissement_formateur_uai) {
      let resformateur = await catalogue.getEtablissements({ query: { uai: formation.etablissement_formateur_uai } });

      if (resformateur.length > 0) {
        logger.info("getEtablissements by FORMATEUR");
        buffer.etablissement.push({ data: resformateur, matched_uai: "UAI_FORMATEUR" });
      }
    }

    if (formation.etablissement_responsable_uai) {
      let resetablissement = await catalogue.getEtablissements({
        query: { uai: formation.etablissement_formateur_uai },
      });

      if (resetablissement.length > 0) {
        logger.info("—— getEtablissements by RESPONSABLE");
        buffer.etablissement.push({ data: resetablissement, matched_uai: "UAI_RESPONSABLE" });
      }
    }

    if (buffer.etablissement.length === 0) return;

    formatted.push({ ...buffer.formation });

    buffer.etablissement.forEach((etab) =>
      etab.data.forEach((x) =>
        formatted.push({
          ...Object.keys(etab).reduce((acc, key) => {
            return { ...acc, [key]: "" };
          }, {}),
          uai_gestionnaire: item.uai_gestionnaire,
          uai_composante: item.uai_composante,
          uai_affilie: item.uai_affilie,
          matched_uai: etab.matched_uai,
          formation_id: buffer.formation._id.toString(),
          etablissement_id: x._id,
          etablissement_nom: x.enseigne,
          etablissement_raison_social: x.entreprise_forme_juridique,
          etablissement_adresse_postal: x.adresse,
          etablissement_code_postal: x.code_postal,
          etablissement_localite: x.region_implantation_nom,
          etablissement_code_commune_insee: x.code_insee_localite,
          etablissement_siret: x.siret,
          etablissement_uai: x.uai,
          etablissement_geoloc: x.geo_coordonnees,
        })
      )
    );
  });

  logger.info("START generating XLSX file....");
  const workbook = createXlsx(formatted);
  await writeXlsxFile(workbook, "/exports", `matching-${matchingType}.xlsx`);
  logger.info("END generating XLSX file....");
};
