const csvToJson = require("convert-csv-to-json");
const azureStorage = require("../../common/azureStorage");
const path = require("path");
const env = require("env-var");
const uniqBy = require("lodash").uniqBy;
const fs = require("fs");

const referentielCodesEnCodesIdccFilePath = path.join(__dirname, "../assets/referentielCodesEnCodesIdcc.csv");
const referentielCodesIdccOpcoFilePath = path.join(__dirname, "../assets/referentielCodesIdccOpco.csv");

let instance;

module.exports = async () => {
  const getInstance = async () => {
    if (instance) {
      return instance;
    }

    // Check if  referentielCodesEnCodesIdcc is in local folder, if not gets it from azure
    if (!fs.existsSync(referentielCodesEnCodesIdccFilePath)) {
      const storage = azureStorage(env.get("CATALOGUE_APPRENTISSAGE_AZURE_STORAGE_CONNECTION_STRING").asString());
      await storage.saveBlobToFile(
        "opco-container",
        "referentielCodesEnCodesIdcc.csv",
        referentielCodesEnCodesIdccFilePath
      );
    }

    // Load csv referential data
    const referentielCodesEnCodesIdcc = csvToJson.getJsonFromCsv(referentielCodesEnCodesIdccFilePath);
    const referentielIdccsOpco = csvToJson.getJsonFromCsv(referentielCodesIdccOpcoFilePath);

    instance = {
      referentielCodesEnCodesIdcc,
      referentielIdccsOpco,
    };

    return instance;
  };

  const { referentielCodesEnCodesIdcc, referentielIdccsOpco } = await getInstance();

  /**
   * Find Idccs for a Code En
   * @param {*} codeEn
   */
  const findIdccsFromCodeEn = (codeEn) => {
    const found = referentielCodesEnCodesIdcc.filter((x) => x.Codelaformation === codeEn && x.Statut === "CPNE");

    if (found.length > 0) {
      // Joining all idccs in one list without empty spaces
      const allIdccs = found
        .map((x) => x.CodeIDCC)
        .join(",")
        .replace(/\s/g, "")
        .split(",");

      return [...new Set(allIdccs)]; // return all uniques idccs
    }

    return [];
  };

  /**
   * Find Opcos for idccs
   * @param {*} codesIdccs
   */
  const findOpcosFromIdccs = (codesIdccs) => {
    return referentielIdccsOpco.filter((x) => codesIdccs.includes(x.IDCC));
  };

  return {
    findIdccsFromCodeEn: findIdccsFromCodeEn,
    findOpcosFromIdccs: findOpcosFromIdccs,
    findOpcosFromCodeEn: async (codeEn) => {
      const codesIdcc = findIdccsFromCodeEn(codeEn);
      return uniqBy(findOpcosFromIdccs(codesIdcc), "Opérateurdecompétences");
    },
  };
};
