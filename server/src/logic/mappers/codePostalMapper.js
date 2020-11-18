const logger = require("../../common/logger");
const { getCpInfo } = require("../common/apiTablesCorrespondances");

const codePostalMapper = async (codePostal = null) => {
  try {
    if (!codePostal) {
      throw new Error("codePostalMapper codePostal must be provided");
    }

    const cpInfo = await getCpInfo(codePostal);
    if (!cpInfo) {
      return {
        result: null,
        messages: null,
      };
    }

    const { result, messages } = cpInfo;
    const { commune, ...rest } = result;

    return {
      result: {
        ...rest,
        localite: commune,
      },
      messages,
    };
  } catch (error) {
    logger.error(error);
    return {
      result: null,
      messages: null,
    };
  }
};

module.exports.codePostalMapper = codePostalMapper;
