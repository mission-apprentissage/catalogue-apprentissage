const path = require("path");
const logger = require("../../common/logger");
const { runScript } = require("../scriptWrapper");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getJsonFromXlsxFile } = require("../../common/utils/fileUtils");
const { AfFormation } = require("../../common/model");

const run = async (/*tableCorrespondance*/) => {
  const filePath = path.resolve(__dirname, "./assets/affelnet-2020.xlsx");
  const data = getJsonFromXlsxFile(filePath);
  let count = 0;

  logger.info(`Importing ${data.length} formations in DB...`);

  await asyncForEach(data, async (item) => {
    /**
     * Code MEF sur 11 caracètres, table de correspondance attend 10
     */

    // if (item["Code MEF"]) {
    //   const responseMEF = await tableCorrespondance.getMefInfo(item["Code MEF"]);

    //   if (responseMEF) {
    //     if (!responseMEF.messages.cfdUpdated === "Non trouvé") {
    //       item.code_cfd = responseMEF.result.cfd.cfd;
    //     }
    //   }
    // }

    try {
      await AfFormation.create({
        uai: item["UAI"],
        libelle_type_etablissement: item["Libellé type établissement"],
        libelle_etablissement: item["Libellé établissement"],
        adresse: item["Adresse"],
        code_postal: item["CP"],
        commune: item["Commune"],
        telephone: item["Téléphone"],
        email: item["Mél"],
        academie: item["Académie"],
        ministere: item["Ministère"],
        etablissement_type: item["Public / Privé"] === "PR" ? "Privée" : "Public",
        type_contrat: item["Type contrat"],
        code_type_etablissement: item["Code type établissement"],
        code_nature: item["Code nature"],
        code_district: item["Code district"],
        code_bassin: item["Code bassin"],
        cio: item["CIO"],
        internat: item["Internat"] === "O" ? true : false,
        reseau_ambition_reussite: item["Réseau ambition réussite"] === "O" ? true : false,
        libelle_mnemonique: item["Mnémonique"],
        code_specialite: item["Code spécialité"],
        libelle_ban: item["Libellé BAN"],
        code_cfd: item.code_cfd,
        code_mef: item["Code MEF"],
        code_voie: item["Code voie"],
        type_voie: item["Libellé voie"],
        saisie_possible_3eme: item["Saisie possible 3me ?"] === "O" ? true : false,
        saisie_reservee_segpa: item["Saisie réservée SEGPA ?"] === "O" ? true : false,
        saisie_possible_2nde: item["Saisie possible 2de ?"] === "O" ? true : false,
        visible_tsa: item["Visible TSA ?"] === "O" ? true : false,
        libelle_formation: item["Libéllé formation"],
        url_onisep_formation: item["URL ONISEP formation"],
        libelle_etablissement_tsa: item["Libellé établissement_1"],
        url_onisep_etablissement: item["URL ONISEP établissement"],
        ville: item["Libellé ville"],
        campus_metier: item["Campus métier ?"] === "O" ? true : false,
        modalites: item["Modalités particulières ?"] === "O" ? true : false,
        coordonnees_gps_latitude: item["Coordonnées GPS latitude"],
        coordonnees_gps_longitude: item["Coordonnées GPS longitude"],
      });

      count = count + 1;
    } catch (error) {
      logger.error(error);
    }
  });

  logger.info(`${count} formation importées !`);
};

if (process.env.standalone) {
  runScript(async ({ tableCorrespondance }) => {
    logger.info(`Start affelnet import`);

    await run(tableCorrespondance);

    logger.info(`End affelnet import`);
  });
}
