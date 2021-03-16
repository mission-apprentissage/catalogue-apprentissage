const { AfFormation, AfReconciliation, RcoFormation, ConvertedFormation, PsFormation2021 } = require("../model");

async function getAllStats() {
  // Catalogue
  const nbCataloguePublished = {
    title: "Nombre de formation publié",
    value: await ConvertedFormation.countDocuments({ published: true }),
  };

  // RCO
  const nbRcoPublished = await RcoFormation.countDocuments({ published: true });
  const nbRcoConversionError = await RcoFormation.countDocuments({ converted_to_mna: { $ne: true } });

  // Parcoursup
  const nbAllPsup = await PsFormation2021.countDocuments();
  const nbAllPsupReconcilied = await PsFormation2021.countDocuments({ etat_reconciliation: true });
  const nbPsupErrors = await ConvertedFormation.countDocuments({ published: true, parcoursup_error: { $ne: null } });
  const nbPsupNotRelevant = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "hors périmètre",
  });
  const nbPsupToCheck = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "à publier" });
  const nbPsupPending = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "en attente de publication",
  });
  const nbPsupPublished = await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "publié" });
  const nbPsupNotPublished = await ConvertedFormation.countDocuments({
    published: true,
    parcoursup_statut: "non publié",
  });

  // Affelnet
  const nbAllAffelnet = await AfFormation.countDocuments();
  const nbAllAffelnetReconcilied = await AfReconciliation.countDocuments();
  const nbAffelnetErrors = await ConvertedFormation.countDocuments({ published: true, affelnet_error: { $ne: null } });
  const nbAffelnetNotRelevant = await ConvertedFormation.countDocuments({
    published: true,
    affelnet_statut: "hors périmètre",
  });
  const nbAffelnetToCheck = await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "à publier" });
  const nbAffelnetPending = await ConvertedFormation.countDocuments({
    published: true,
    affelnet_statut: "en attente de publication",
  });
  const nbAffelnetPublished = await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "publié" });
  const nbAffelnetNotPublished = await ConvertedFormation.countDocuments({
    published: true,
    affelnet_statut: "non publié",
  });

  return {
    catalogue: [],
    nbCataloguePublished,
    nbRcoPublished,
    nbRcoConversionError,
    nbAllPsup,
    nbAllPsupReconcilied,
    nbPsupErrors,
    nbPsupNotRelevant,
    nbPsupToCheck,
    nbPsupPending,
    nbPsupPublished,
    nbPsupNotPublished,
    nbAllAffelnet,
    nbAllAffelnetReconcilied,
    nbAffelnetErrors,
    nbAffelnetNotRelevant,
    nbAffelnetToCheck,
    nbAffelnetPending,
    nbAffelnetPublished,
    nbAffelnetNotPublished,
  };
}

module.exports = { getAllStats };
