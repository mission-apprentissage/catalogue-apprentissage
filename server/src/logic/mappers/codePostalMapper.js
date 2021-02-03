const logger = require("../../common/logger");
const tablesCorrespondance = require("../../common/components/tables_correspondance");

const codePostalMapper = async (codePostal = null) => {
  try {
    if (!codePostal) {
      throw new Error("codePostalMapper codePostal must be provided");
    }

    const cpInfo = await tablesCorrespondance().getCpInfo(codePostal);
    if (!cpInfo) {
      return {
        result: null,
        messages: {
          error: `Unable to retrieve data from codePostal ${codePostal}`,
        },
      };
    }

    const { result, messages } = cpInfo;
    // eslint-disable-next-line no-unused-vars
    const { num_region, commune, num_academie, ...rest } = result;

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
