const logger = require("../../../common/logger");
const { Formation } = require("../../../common/models");
const { AFFELNET_STATUS } = require("../../../constants/status");

const run = async () => {
  const filterGeneral = { catalogue_published: true, published: true };
  const filterNonReglementaire = { catalogue_published: false, published: true };

  const total = await Formation.countDocuments({});
  const totalGeneral = await Formation.countDocuments(filterGeneral);
  const totalNonReglementaire = await Formation.countDocuments(filterNonReglementaire);

  const totalNotRelevant = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
  });
  const totalGeneralNotRelevant = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
  });
  const totalNonReglementaireNotRelevant = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
  });

  const totalToValidate = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  });
  const totalGeneralToValidate = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  });
  const totalNonReglementaireToValidate = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  });

  const totalToCheck = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
  });
  const totalGeneralToCheck = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
  });
  const totalNonReglementaireToCheck = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
  });

  const totalPending = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });
  const totalGeneralPending = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });
  const totalNonReglementairePending = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });

  const totalPublished = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
  });
  const totalGeneralPublished = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
  });
  const totalNonReglementairePublished = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
  });

  const totalNotPublished = await Formation.countDocuments({
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
  });
  const totalGeneralNotPublished = await Formation.countDocuments({
    ...filterGeneral,
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
  });
  const totalNonReglementaireNotPublished = await Formation.countDocuments({
    ...filterNonReglementaire,
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
  });

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

    "statut 'non publiable en l'état'": {
      "catalogue général": totalGeneralNotRelevant,
      "catalogue non règlementaire": totalNonReglementaireNotRelevant,
      "total (y compris archives)": totalNotRelevant,
    },
    "statut 'à publier (soumis à validation)' ": {
      "catalogue général": totalGeneralToValidate,
      "catalogue non règlementaire": totalNonReglementaireToValidate,
      "total (y compris archives)": totalToValidate,
    },
    "statut 'à publier' ": {
      "catalogue général": totalGeneralToCheck,
      "catalogue non règlementaire": totalNonReglementaireToCheck,
      "total (y compris archives)": totalToCheck,
    },
    "statut 'en attente de publication' ": {
      "catalogue général": totalGeneralPending,
      "catalogue non règlementaire": totalNonReglementairePending,
      "total (y compris archives)": totalPending,
    },
    "statut 'publié' ": {
      "catalogue général": totalGeneralPublished,
      "catalogue non règlementaire": totalNonReglementairePublished,
      "total (y compris archives)": totalPublished,
    },
    "statut 'NON publié' ": {
      "catalogue général": totalGeneralNotPublished,
      "catalogue non règlementaire": totalNonReglementaireNotPublished,
      "total (y compris archives)": totalNotPublished,
    },

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

  console.table(results);

  logger.info(
    { type: "job" },
    results
    //   `Compteurs des formations dans le catalogue (catalogue général / catalogue non règlementaire / total (y compris archives)):
    //     - total : ${totalGeneral} / ${totalNonReglementaire} / ${total}

    //     - statut "non publiable en l'état" : ${totalGeneralNotRelevant} / ${totalNonReglementaireNotRelevant} / ${totalNotRelevant}
    //     - statut "à publier (soumis à validation)" : ${totalGeneralToValidate} / ${totalNonReglementaireToValidate} / ${totalToValidate}
    //     - statut "à publier" : ${totalGeneralToCheck} / ${totalNonReglementaireToCheck} / ${totalToCheck}
    //     - statut "en attente de publication" : ${totalGeneralPending} / ${totalNonReglementairePending} / ${totalPending}
    //     - statut "publié" : ${totalGeneralPublished} / ${totalNonReglementairePublished} / ${totalPublished}
    //     - statut "NON publié" : ${totalGeneralNotPublished} / ${totalNonReglementaireNotPublished} / ${totalNotPublished}

    //     - dans le périmètre : ${totalGeneralPérimètre} / ${totalNonReglementairePérimètre} / ${totalPérimètre}
    //     - hors périmètre : ${totalGeneralHorsPérimètre} / ${totalNonReglementaireHorsPérimètre} / ${totalHorsPérimètre}`
  );
};
module.exports = { run };
