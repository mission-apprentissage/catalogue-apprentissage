const logger = require("../../../common/logger");
const { Formation } = require("../../../common/models");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  const filterReglement = { catalogue_published: true, published: true };

  const total = await Formation.countDocuments({});
  const totalReglement = await Formation.countDocuments(filterReglement);

  const totalNotRelevant = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  });
  const totalReglementNotRelevant = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  });

  const totalToValidateHabilitation = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
  const totalReglementToValidateHabilitation = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });

  const totalToValidate = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });
  const totalReglementToValidate = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });

  const totalToValidateRecteur = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });
  const totalReglementToValidateRecteur = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });

  const totalToCheck = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
  const totalReglementToCheck = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });

  const totalPending = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  });
  const totalReglementPending = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  });

  const totalRejected = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });
  const totalReglementRejected = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });

  const totalPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalReglementPublished = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });

  const totalNotPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });
  const totalReglementNotPublished = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });

  const totalClosed = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalReglementClosed = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_statut: PARCOURSUP_STATUS.FERME,
  });

  const totalPérimètre = await Formation.countDocuments({ parcoursup_perimetre: true });
  const totalReglementPérimètre = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_perimetre: true,
  });

  const totalHorsPérimètre = await Formation.countDocuments({ parcoursup_perimetre: false });
  const totalReglementHorsPérimètre = await Formation.countDocuments({
    ...filterReglement,
    parcoursup_perimetre: false,
  });

  logger.info(
    { type: "job" },
    `Compteurs des formations dans le catalogue (règlementaire / total):
      - total : ${totalReglement} / ${total}

      - statut "non publiable en l'état" : ${totalReglementNotRelevant} / ${totalNotRelevant}
      - statut "à publier (sous condition habilitation)" : ${totalReglementToValidateHabilitation} / ${totalToValidateHabilitation}
      - statut "à publier (vérifier accès direct postbac)" : ${totalReglementToValidate} / ${totalToValidate}
      - statut "à publier (soumis à validation Recteur)" : ${totalReglementToValidateRecteur} / ${totalToValidateRecteur}
      - statut "à publier" : ${totalReglementToCheck} / ${totalToCheck}
      - statut "en attente de publication" : ${totalReglementPending} / ${totalPending}
      - statut "publié" sur ParcourSup : ${totalReglementPublished} / ${totalPublished}
      - statut "rejeté" par ParcourSup : ${totalReglementRejected} / ${totalRejected}
      - statut "NON publié" sur ParcourSup : ${totalReglementNotPublished} / ${totalNotPublished}
      - statut "fermé" sur ParcourSup : ${totalReglementClosed} / ${totalClosed}

      - dans le périmètre: ${totalReglementPérimètre} / ${totalPérimètre}
      - hors périmètre : ${totalReglementHorsPérimètre} / ${totalHorsPérimètre}`
  );
};
module.exports = { run };
