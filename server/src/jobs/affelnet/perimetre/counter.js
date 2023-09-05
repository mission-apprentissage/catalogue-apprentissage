const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model");
const { AFFELNET_STATUS } = require("../../../constants/status");

const run = async () => {
  const total = await Formation.countDocuments({});
  const totalReglement = await Formation.countDocuments({ catalogue_published: true, published: true });

  const totalNotRelevant = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
  });
  const totalReglementNotRelevant = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
  });

  const totalToValidate = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  });
  const totalReglementToValidate = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  });

  const totalToCheck = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
  });
  const totalReglementToCheck = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
  });

  const totalPending = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });
  const totalReglementPending = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });

  const totalPsPublished = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
  });
  const totalReglementPsPublished = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
  });

  const totalPsNotPublished = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
  });
  const totalReglementPsNotPublished = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
  });

  const totalPérimètre = await Formation.countDocuments({ affelnet_perimetre: true });
  const totalReglementPérimètre = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_perimetre: true,
  });
  const totalHorsPérimètre = await Formation.countDocuments({ affelnet_perimetre: false });
  const totalReglementHorsPérimètre = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    affelnet_perimetre: false,
  });

  logger.info(
    { type: "job" },
    `Compteurs des formations dans le catalogue (règlementaire / total):
      - total : ${totalReglement} / ${total}

      - statut "hors périmètre" : ${totalReglementNotRelevant} / ${totalNotRelevant}
      - statut "à publier (soumis à validation)" : ${totalReglementToValidate} / ${totalToValidate}
      - statut "à publier" : ${totalReglementToCheck} / ${totalToCheck}
      - statut "en attente de publication" : ${totalReglementPending} / ${totalPending}
      - statut "publié" sur Affelnet : ${totalReglementPsPublished} / ${totalPsPublished}
      - statut "NON publié" sur Affelnet : ${totalReglementPsNotPublished} / ${totalPsNotPublished}

      - dans le périmètre: ${totalReglementPérimètre} / ${totalPérimètre}
      - hors périmètre : ${totalReglementHorsPérimètre} / ${totalHorsPérimètre}`
  );
};
module.exports = { run };
