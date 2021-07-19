const logger = require("../../common/logger");
const { getAddressFromCoordinates } = require("@mission-apprentissage/tco-service-node");

const geoMapper = async (coordinates = "", codeInsee) => {
  try {
    if (!coordinates) {
      throw new Error("geoMapper coordinates must be provided");
    }

    const [latitude, longitude] = coordinates.split(",");
    const { result, messages } = await getAddressFromCoordinates({ latitude, longitude });
    if (!result?.adresse || messages?.error) {
      return {
        result: null,
        messages: {
          error: `Unable to retrieve data from coordinates ${coordinates} ${messages?.error ?? ""}`,
        },
      };
    }

    // eslint-disable-next-line no-unused-vars
    const { num_region, nom_voie, type_voie, numero_voie, commune, ...rest } = result.adresse;

    // check result is in the same town
    if (codeInsee !== rest.code_commune_insee) {
      throw new Error(
        `geoMapper code Insee inconsistent results : original code ${codeInsee}, code given by api adresse ${rest.code_commune_insee}`
      );
    }

    return {
      result: {
        ...rest,
        adresse: [numero_voie, type_voie, nom_voie].join(" ").trim(),
        localite: commune,
      },
      messages,
    };
  } catch (e) {
    logger.error(e);
    return {
      result: null,
      messages: {
        error: e.toString(),
      },
    };
  }
};

module.exports = { geoMapper };
