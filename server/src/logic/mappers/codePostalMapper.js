const logger = require("../../common/logger");
const { getCpInfo } = require("../common/apiTablesCorrespondances");

const codePostalMapper = async (codePostal = null) => {
  try {
    if (!codePostal) {
      throw new Error("codePostalMapper codePostal must be provided");
    }

    const { result, messages } = await getCpInfo(codePostal);

    // eslint-disable-next-line no-unused-vars
    const { commune, ...rest } = result;

    // check when empty or errored

    return {
      result: {
        ...rest,
        localite: result.commune,
      },
      messages,
    };
  } catch (error) {
    logger.error(error);
    return {
      data: null,
      messages: null,
    };
  }
};

module.exports.codePostalMapper = codePostalMapper;
