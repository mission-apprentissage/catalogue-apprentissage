const logger = require("../../common/logger");
const { getCpInfo } = require("@mission-apprentissage/tco-service-node");

const codePostalMapper = async (codePostal = null) => {
  try {
    if (!codePostal) {
      throw new Error("codePostalMapper codePostal must be provided");
    }

    const cpInfo = await getCpInfo(codePostal);
    if (!cpInfo || cpInfo?.messages?.error) {
      return {
        result: null,
        messages: {
          error: `Unable to retrieve data from codePostal ${codePostal} ${cpInfo?.messages?.error ?? ""}`,
        },
      };
    }

    const { result, messages } = cpInfo;
    // eslint-disable-next-line no-unused-vars
    const { num_region, commune, num_academie, ...rest } = result;

    // check result is in the same department
    const dept = `${codePostal}`.substring(0, 2);
    if (!result.code_commune_insee?.startsWith(dept) && !result.code_postal?.startsWith(dept)) {
      throw new Error(
        `codePostalMapper codePostal inconsistent results : original code ${codePostal}, code given by api adresse ${result.code_postal}`
      );
    }

    return {
      result: {
        ...rest,
        localite: commune,
        num_academie: `${num_academie}`,
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

module.exports.codePostalMapper = codePostalMapper;
