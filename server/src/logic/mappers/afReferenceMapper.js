/**
 * Mapper afReconciliation
 */

const logger = require("../../common/logger");
const { AfReconciliation } = require("../../common/model");
const checkCFD = require("../../common/utils/cfdUtils");
const checkSIRET = require("../../common/utils/siretUtils");

module.exports = async (payload) => {
  const { cfd, siret_formateur, siret_gestionnaire } = payload;

  if (checkCFD(cfd) === false) {
    return {
      affelnet_reference: false,
      messages: {
        error: "Le code formation diplôme doit être définit et au format 8 caractères ou 9 avec la lettre specialité",
      },
    };
  }

  if (checkSIRET(siret_formateur) === false) {
    return {
      affelnet_reference: false,
      messages: {
        error: "Le siret formateur doit être définit et au format 14 caractères",
      },
    };
  }

  if (checkSIRET(siret_gestionnaire) === false) {
    return {
      affelnet_reference: false,
      messages: {
        error: "Le siret gestionnaire doit être au format 14 caractères",
      },
    };
  }

  try {
    const response = await AfReconciliation.findOne({
      code_cfd: cfd,
      siret_formateur: siret_formateur,
      siret_gestionnaire: siret_gestionnaire,
    });

    if (!response) {
      const checkReverse = await AfReconciliation.findOne({
        code_cfd: cfd,
        siret_formateur: siret_gestionnaire,
        siret_gestionnaire: siret_formateur,
      });

      if (checkReverse) {
        return {
          affelnet_reference: false,
          messages: {
            error: "Les sirets sont inversés",
          },
        };
      }

      return {
        affelnet_reference: false,
      };
    }

    return {
      affelnet_reference: true,
    };
  } catch (error) {
    logger.error(error);

    return {
      error: error,
    };
  }
};
