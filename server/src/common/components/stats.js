const { AfFormation, AfReconciliation, RcoFormation, ConvertedFormation, PsFormation2021 } = require("../model");

async function getAllStats() {
  // Catalogue
  const nbCataloguePublished = {
    title: "Formations publiées",
    value: await ConvertedFormation.countDocuments({ published: true }),
  };

  // RCO
  const nbRcoPublished = {
    title: "Formations RCO publiées",
    value: await RcoFormation.countDocuments({ published: true }),
  };
  const nbRcoConversionError = {
    title: "Formations RCO en erreur",
    value: await RcoFormation.countDocuments({ converted_to_mna: { $ne: true } }),
  };

  // Parcoursup
  const nbAllPsup = {
    title: "Nombre de formations",
    value: await PsFormation2021.countDocuments({}),
  };
  const nbAllPsupReconcilied = {
    title: "Formation réconcilié",
    value: await PsFormation2021.countDocuments({ etat_reconciliation: true }),
  };
  const nbPsupErrors = {
    title: "Formations en erreur",
    value: await ConvertedFormation.countDocuments({ published: true, parcoursup_error: { $ne: null } }),
  };
  const nbPsupNotRelevant = {
    title: "Formations hors périmètre",
    value: await ConvertedFormation.countDocuments({
      published: true,
      parcoursup_statut: "hors périmètre",
    }),
  };
  const nbPsupToBePublished = {
    title: "Formations à publier",
    value: await ConvertedFormation.countDocuments({
      published: true,
      parcoursup_statut: "à publier",
    }),
  };
  const nbPsupToCheck = {
    title: "Formations à publier (vérifier accès direct postbac)",
    value: await ConvertedFormation.countDocuments({
      published: true,
      parcoursup_statut: "à publier (vérifier accès direct postbac)",
    }),
  };
  const nbPsupToSubmit = {
    title: "Formations à publier (soumis à validation Recteur)",
    value: await ConvertedFormation.countDocuments({
      published: true,
      parcoursup_statut: "à publier (soumis à validation Recteur)",
    }),
  };
  const nbPsupPending = {
    title: "Formations en attente de publication",
    value: await ConvertedFormation.countDocuments({
      published: true,
      parcoursup_statut: "en attente de publication",
    }),
  };
  const nbPsupPublished = {
    title: "Formations publiées",
    value: await ConvertedFormation.countDocuments({ published: true, parcoursup_statut: "publié" }),
  };
  const nbPsupNotPublished = {
    title: "Formations non publiées",
    value: await ConvertedFormation.countDocuments({
      published: true,
      parcoursup_statut: "non publié",
    }),
  };

  // Affelnet
  const nbAllAffelnet = {
    title: "Nombre de formations",
    value: await AfFormation.countDocuments(),
  };
  const nbAllAffelnetReconcilied = {
    title: "Formations réconciliées",
    value: await AfReconciliation.countDocuments(),
  };
  const nbAffelnetErrors = {
    title: "Formations en erreur",
    value: await ConvertedFormation.countDocuments({ published: true, affelnet_error: { $ne: null } }),
  };
  const nbAffelnetNotRelevant = {
    title: "Formations hors périmètre",
    value: await ConvertedFormation.countDocuments({
      published: true,
      affelnet_statut: "hors périmètre",
    }),
  };
  const nbAffelnetToCheck = {
    title: "Formations à publier",
    value: await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "à publier" }),
  };
  const nbAffelnetToSubmit = {
    title: "Formations à publier (soumis à validation)",
    value: await ConvertedFormation.countDocuments({
      published: true,
      affelnet_statut: "à publier (soumis à validation)",
    }),
  };
  const nbAffelnetPending = {
    title: "Formations en attente de publication",
    value: await ConvertedFormation.countDocuments({
      published: true,
      affelnet_statut: "en attente de publication",
    }),
  };
  const nbAffelnetPublished = {
    title: "Formations publié",
    value: await ConvertedFormation.countDocuments({ published: true, affelnet_statut: "publié" }),
  };
  const nbAffelnetNotPublished = {
    title: "Formations non publié",
    value: await ConvertedFormation.countDocuments({
      published: true,
      affelnet_statut: "non publié",
    }),
  };

  return {
    catalogue: [nbCataloguePublished, nbRcoPublished, nbRcoConversionError],
    parcoursup: [
      nbAllPsup,
      nbAllPsupReconcilied,
      nbPsupErrors,
      nbPsupNotRelevant,
      nbPsupToBePublished,
      nbPsupToCheck,
      nbPsupToSubmit,
      nbPsupPending,
      nbPsupPublished,
      nbPsupNotPublished,
    ],
    affelnet: [
      nbAllAffelnet,
      nbAllAffelnetReconcilied,
      nbAffelnetErrors,
      nbAffelnetNotRelevant,
      nbAffelnetToCheck,
      nbAffelnetToSubmit,
      nbAffelnetPending,
      nbAffelnetPublished,
      nbAffelnetNotPublished,
    ],
  };
}

module.exports = { getAllStats };
