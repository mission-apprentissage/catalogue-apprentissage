const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  console.log("Calcul des statistiques.");
  // End. Calcul de statistiques liées à l'application des règles de périmètres
  const totalPublished = await Formation.countDocuments({ published: true });
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
    `Total formations publiées dans le catalogue : ${totalPublished}\n` +
      `Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}\n` +
      `Total formations à publier (sous condition habilitation) : ${totalToValidateHabilitation}/${totalPublished}\n` +
      `Total formations à publier (vérifier accès direct postbac) : ${totalToValidate}/${totalPublished}\n` +
      `Total formations à publier (soumis à validation Recteur) : ${totalToValidateRecteur}/${totalPublished}\n` +
      `Total formations à publier : ${totalToCheck}/${totalPublished}\n` +
      `Total formations en attente de publication : ${totalPending}/${totalPublished}\n` +
      `Total formations publiées sur ParcourSup : ${totalPsPublished}/${totalPublished}\n` +
      `Total formations rejetée par ParcourSup : ${totalRejected}/${totalPublished}\n` +
      `Total formations NON publiées sur ParcourSup : ${totalPsNotPublished}/${totalPublished}`
  );

  const totalPérimètre = await Formation.countDocuments({ parcoursup_perimetre: true });
  const totalHorsPérimètre = await Formation.countDocuments({ parcoursup_perimetre: false });

  logger.info(
    `Total formations dans le périmètre: ${totalPérimètre}\n` +
      `Total formations hors périmètre : ${totalHorsPérimètre}`
  );
};
module.exports = { run };
