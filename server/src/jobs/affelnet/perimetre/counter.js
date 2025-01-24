const logger = require("../../../common/logger");
const { Formation } = require("../../../common/models");
const { AFFELNET_STATUS } = require("../../../constants/status");

const run = async () => {
  const filterGeneral = { catalogue_published: true, published: true };
  const filterNonReglementaire = { catalogue_published: false, published: true };

  const total = await Formation.countDocuments({});
  const totalGeneral = await Formation.countDocuments(filterGeneral);
  const totalNonReglementaire = await Formation.countDocuments(filterNonReglementaire);

  const totalByStatus = Object.assign(
    {},
    ...(await Promise.all(
      Object.values(AFFELNET_STATUS).map(async (status) => ({
        [`statut "${status}"`]: {
          "catalogue général": await Formation.countDocuments({
            affelnet_statut: status,
            ...filterGeneral,
          }),
          "catalogue non règlementaire": await Formation.countDocuments({
            affelnet_statut: status,
            ...filterNonReglementaire,
          }),
          "total (y compris archives)": await Formation.countDocuments({
            affelnet_statut: status,
          }),
        },
      }))
    ))
  );

  const totalPérimètre = await Formation.countDocuments({ affelnet_perimetre: true });
  const totalGeneralPérimètre = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_perimetre: true,
  });
  const totalNonReglementairePérimètre = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_perimetre: true,
  });

  const totalHorsPérimètre = await Formation.countDocuments({ affelnet_perimetre: false });
  const totalGeneralHorsPérimètre = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_perimetre: false,
  });
  const totalNonReglementaireHorsPérimètre = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_perimetre: false,
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
    "hors périmètre": {
      "catalogue général": totalGeneralHorsPérimètre,
      "catalogue non règlementaire": totalNonReglementaireHorsPérimètre,
      "total (y compris archives)": totalHorsPérimètre,
    },
  };

  logger.info({ type: "job" }, results);

  console.table(results);
};
module.exports = { run };
