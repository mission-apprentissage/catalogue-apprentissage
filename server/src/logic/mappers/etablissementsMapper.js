const logger = require("../../common/logger");
const { getEtablissement } = require("../common/apiOldCatalogue");

const getAttachedEstablishments = async (etablissement_gestionnaire_siret, etablissement_formateur_siret) => {
  // Get establishment Gestionnaire
  const gestionnaire = await getEtablissement({
    siret: etablissement_gestionnaire_siret,
  });

  // Get establishment Formateur
  const formateur = await getEtablissement({
    siret: etablissement_formateur_siret,
  });

  return {
    gestionnaire,
    formateur,
  };
};

const mnaFormationEtablissementsMapper = async (etablissement_gestionnaire_siret, etablissement_formateur_siret) => {
  try {
    if (!etablissement_gestionnaire_siret && !etablissement_formateur_siret) {
      throw new Error(
        "mnaFormationEtablissementsMapper etablissement_gestionnaire_siret, etablissement_formateur_siret  must be provided"
      );
    }

    const attachedEstablishments = await getAttachedEstablishments(
      etablissement_gestionnaire_siret,
      etablissement_formateur_siret
    );
    console.log(attachedEstablishments);

    // check when empty or errored

    return {
      result: {},
      //messages,
    };
  } catch (error) {
    logger.error(error);
    return {
      data: null,
      messages: null,
    };
  }
};

module.exports.mnaFormationEtablissementsMapper = mnaFormationEtablissementsMapper;
