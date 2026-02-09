const logger = require("../../../common/logger");
const { Formation } = require("../../../common/models");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const config = require("config");

const run = async () => {
  const filterGeneral = { catalogue_published: true, published: true };
  const filterNonReglementaire = { catalogue_published: false, published: true };

  const total = await Formation.countDocuments({});
  const totalGeneral = await Formation.countDocuments(filterGeneral);
  const totalNonReglementaire = await Formation.countDocuments(filterNonReglementaire);

  const totalByStatus = Object.assign(
    {},
    ...(await Promise.all(
      Object.values(PARCOURSUP_STATUS).map(async (status) => ({
        [`statut "${status}"`]: {
          "catalogue général": await Formation.countDocuments({
            parcoursup_statut: status,
            ...filterGeneral,
          }),
          "catalogue non règlementaire": await Formation.countDocuments({
            parcoursup_statut: status,
            ...filterNonReglementaire,
          }),
          "total (y compris archives)": await Formation.countDocuments({
            parcoursup_statut: status,
          }),
        },
      }))
    ))
  );

  const totalPérimètre = await Formation.countDocuments({ parcoursup_perimetre: true });
  const totalGeneralPérimètre = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_perimetre: true,
  });
  const totalNonReglementairePérimètre = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_perimetre: true,
  });

  const totalPérimètreAvecSession = await Formation.countDocuments({
    parcoursup_perimetre: true,
    parcoursup_session: true,
  });
  const totalGeneralPérimètreAvecSession = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_perimetre: true,
    parcoursup_session: true,
  });
  const totalNonReglementairePérimètreAvecSession = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_perimetre: true,
    parcoursup_session: true,
  });

  const totalHorsPérimètre = await Formation.countDocuments({ parcoursup_perimetre: false });
  const totalGeneralHorsPérimètre = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_perimetre: false,
  });
  const totalNonReglementaireHorsPérimètre = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_perimetre: false,
  });

  const results = {
    total: {
      "catalogue général": totalGeneral,
      "catalogue non règlementaire": totalNonReglementaire,
      "total (y compris archives)": total,
    },

    ...totalByStatus,

    "dans le périmètre": {
      "catalogue général": totalGeneralPérimètre,
      "catalogue non règlementaire": totalNonReglementairePérimètre,
      "total (y compris archives)": totalPérimètre,
    },

    "dans le périmètre avec session ": {
      "catalogue général": totalGeneralPérimètreAvecSession,
      "catalogue non règlementaire": totalNonReglementairePérimètreAvecSession,
      "total (y compris archives)": totalPérimètreAvecSession,
    },

    "hors périmètre": {
      "catalogue général": totalGeneralHorsPérimètre,
      "catalogue non règlementaire": totalNonReglementaireHorsPérimètre,
      "total (y compris archives)": totalHorsPérimètre,
    },
  };

  config.env !== "local" && logger.info({ type: "job" }, results);

  config.env === "local" && console.table(results);
};
module.exports = { run };
