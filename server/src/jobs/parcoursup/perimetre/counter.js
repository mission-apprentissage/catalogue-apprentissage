const logger = require("../../../common/logger");
const { Formation } = require("../../../common/models");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  const filterGeneral = { catalogue_published: true, published: true };
  const filterNonReglementaire = { catalogue_published: false, published: true };

  const total = await Formation.countDocuments({});
  const totalGeneral = await Formation.countDocuments(filterGeneral);
  const totalNonReglementaire = await Formation.countDocuments(filterNonReglementaire);

  const totalNotRelevant = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  });
  const totalGeneralNotRelevant = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  });
  const totalNonReglementaireNotRelevant = await Formation.countDocuments({
    ...totalNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  });

  const totalToValidateHabilitation = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
  const totalGeneralToValidateHabilitation = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
  const totalNonReglementaireToValidateHabilitation = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });

  const totalToValidate = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });
  const totalGeneralToValidate = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });
  const totalNonReglementaireToValidate = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });

  const totalToValidateRecteur = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });
  const totalGeneralToValidateRecteur = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });
  const totalNonReglementaireToValidateRecteur = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });

  const totalToCheck = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
  const totalGeneralToCheck = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
  const totalNonReglementaireToCheck = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });

  const totalPending = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
  });
  const totalGeneralPending = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
  });
  const totalNonReglementairePending = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
  });

  const totalRejected = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });
  const totalGeneralRejected = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });
  const totalNonReglementaireRejected = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });

  const totalPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalGeneralPublished = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalNonReglementairePublished = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });

  const totalNotPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });
  const totalGeneralNotPublished = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });
  const totalNonReglementaireNotPublished = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });

  const totalClosed = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalGeneralClosed = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_statut: PARCOURSUP_STATUS.FERME,
  });
  const totalNonReglementaireClosed = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_statut: PARCOURSUP_STATUS.FERME,
  });

  const totalPérimètre = await Formation.countDocuments({ parcoursup_perimetre: true });
  const totalGeneralPérimètre = await Formation.countDocuments({
    ...filterGeneral,
    parcoursup_perimetre: true,
  });
  const totalNonReglementairePérimètre = await Formation.countDocuments({
    ...filterNonReglementaire,
    parcoursup_perimetre: true,
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

    "statut 'non publiable en l'état'": {
      "catalogue général": totalGeneralNotRelevant,
      "catalogue non règlementaire": totalNonReglementaireNotRelevant,
      "total (y compris archives)": totalNotRelevant,
    },
    "statut 'à publier (sous condition habilitation)' ": {
      "catalogue général": totalGeneralToValidateHabilitation,
      "catalogue non règlementaire": totalNonReglementaireToValidateHabilitation,
      "total (y compris archives)": totalToValidateHabilitation,
    },
    "statut 'à publier (vérifier accès direct postbac)' ": {
      "catalogue général": totalGeneralToValidate,
      "catalogue non règlementaire": totalNonReglementaireToValidate,
      "total (y compris archives)": totalToValidate,
    },
    "statut 'à publier (soumis à validation Recteur)' ": {
      "catalogue général": totalGeneralToValidateRecteur,
      "catalogue non règlementaire": totalNonReglementaireToValidateRecteur,
      "total (y compris archives)": totalToValidateRecteur,
    },
    "statut 'à publier' ": {
      "catalogue général": totalGeneralToCheck,
      "catalogue non règlementaire": totalNonReglementaireToCheck,
      "total (y compris archives)": totalToCheck,
    },
    "statut 'prêt pour intégration' ": {
      "catalogue général": totalGeneralPending,
      "catalogue non règlementaire": totalNonReglementairePending,
      "total (y compris archives)": totalPending,
    },
    "statut 'publié' ": {
      "catalogue général": totalGeneralPublished,
      "catalogue non règlementaire": totalNonReglementairePublished,
      "total (y compris archives)": totalPublished,
    },
    "statut 'rejeté' ": {
      "catalogue général": totalGeneralRejected,
      "catalogue non règlementaire": totalNonReglementaireRejected,
      "total (y compris archives)": totalRejected,
    },
    "statut 'NON publié' ": {
      "catalogue général": totalGeneralNotPublished,
      "catalogue non règlementaire": totalNonReglementaireNotPublished,
      "total (y compris archives)": totalNotPublished,
    },
    "statut 'fermé' ": {
      "catalogue général": totalGeneralClosed,
      "catalogue non règlementaire": totalNonReglementaireClosed,
      "total (y compris archives)": totalClosed,
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

  logger.info({ type: "job" }, results);
};
module.exports = { run };
