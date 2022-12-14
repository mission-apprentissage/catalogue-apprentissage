const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  console.log("Calcul des statistiques.");

  const total = await Formation.countDocuments({});

  const totalReglement = await Formation.countDocuments({ catalogue_published: true, published: true });

  const totalNotRelevant = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
  });
  const totalToValidateHabilitation = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
  const totalToValidate = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  });
  const totalToValidateRecteur = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  });
  const totalToCheck = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
  const totalPending = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  });
  const totalRejected = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.REJETE,
  });
  const totalPsPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
  });
  const totalPsNotPublished = await Formation.countDocuments({
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
  });

  logger.info(
    `Compteurs des formations dans le catalogue sur un total de ${total} (${totalReglement} dans le catalogue général) :\n` +
      `- publiées dans le catalogue général : ${totalReglement}\n` +
      `- statut "hors périmètre" : ${totalNotRelevant}\n` +
      `- statut "à publier (sous condition habilitation)" : ${totalToValidateHabilitation}\n` +
      `- statut "à publier (vérifier accès direct postbac)" : ${totalToValidate}\n` +
      `- statut "à publier (soumis à validation Recteur)" : ${totalToValidateRecteur}\n` +
      `- statut "à publier" : ${totalToCheck}\n` +
      `- statut "en attente de publication" : ${totalPending}\n` +
      `- statut "publié" sur ParcourSup : ${totalPsPublished}\n` +
      `- statut "rejeté" par ParcourSup : ${totalRejected}\n` +
      `- statut "NON publié" sur ParcourSup : ${totalPsNotPublished}`
  );

  const totalPérimètre = await Formation.countDocuments({ parcoursup_perimetre: true });
  const totalHorsPérimètre = await Formation.countDocuments({ parcoursup_perimetre: false });

  logger.info(
    `Total formations dans le périmètre: ${totalPérimètre}\n` +
      `Total formations hors périmètre : ${totalHorsPérimètre}`
  );
};
module.exports = { run };
