const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  const total = await Formation.countDocuments({});
  const totalReglement = await Formation.countDocuments({ catalogue_published: true, published: true });

  const totalNotRelevant = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
  });
  const totalReglementNotRelevant = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
  });

  const totalToValidateHabilitation = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
  const totalReglementToValidateHabilitation = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });

  const totalToValidate = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });
  const totalReglementToValidate = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });

  const totalToValidateRecteur = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });
  const totalReglementToValidateRecteur = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });

  const totalToCheck = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
  const totalReglementToCheck = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });

  const totalPending = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  });
  const totalReglementPending = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  });

  const totalRejected = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });
  const totalReglementRejected = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });

  const totalPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalReglementPublished = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });

  const totalNotPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });
  const totalReglementNotPublished = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });

  const totalClosed = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalReglementClosed = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_statut: PARCOURSUP_STATUS.FERME,
  });

  const totalPérimètre = await Formation.countDocuments({ parcoursup_perimetre: true });
  const totalReglementPérimètre = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_perimetre: true,
  });
  const totalHorsPérimètre = await Formation.countDocuments({ parcoursup_perimetre: false });
  const totalReglementHorsPérimètre = await Formation.countDocuments({
    catalogue_published: true,
    published: true,
    parcoursup_perimetre: false,
  });

  logger.info(
    `Compteurs des formations dans le catalogue (règlementaire / total):\n` +
      `- total : ${totalReglement} / ${total}\n` +
      `\n` +
      `- statut "hors périmètre" : ${totalReglementNotRelevant} / ${totalNotRelevant}\n` +
      `- statut "à publier (sous condition habilitation)" : ${totalReglementToValidateHabilitation} / ${totalToValidateHabilitation}\n` +
      `- statut "à publier (vérifier accès direct postbac)" : ${totalReglementToValidate} / ${totalToValidate}\n` +
      `- statut "à publier (soumis à validation Recteur)" : ${totalReglementToValidateRecteur} / ${totalToValidateRecteur}\n` +
      `- statut "à publier" : ${totalReglementToCheck} / ${totalToCheck}\n` +
      `- statut "en attente de publication" : ${totalReglementPending} / ${totalPending}\n` +
      `- statut "publié" sur ParcourSup : ${totalReglementPublished} / ${totalPublished}\n` +
      `- statut "rejeté" par ParcourSup : ${totalReglementRejected} / ${totalRejected}\n` +
      `- statut "NON publié" sur ParcourSup : ${totalReglementNotPublished} / ${totalNotPublished}\n` +
      `- statut "fermé" sur ParcourSup : ${totalReglementClosed} / ${totalClosed}\n` +
      `\n` +
      `- dans le périmètre: ${totalReglementPérimètre} / ${totalPérimètre}\n` +
      `- hors périmètre : ${totalReglementHorsPérimètre} / ${totalHorsPérimètre}\n`
  );

  logger.info();
};
module.exports = { run };
