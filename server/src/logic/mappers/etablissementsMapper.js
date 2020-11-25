const logger = require("../../common/logger");
const { getEtablissement } = require("../common/apiOldCatalogue");
const { codePostalMapper } = require("./codePostalMapper");

const getAttachedEstablishments = async (etablissement_gestionnaire_siret, etablissement_formateur_siret) => {
  // Get establishment Gestionnaire
  const gestionnaire = await getEtablissement({
    siret: etablissement_gestionnaire_siret,
  });

  // Get establishment Formateur
  let formateur;
  if (etablissement_gestionnaire_siret === etablissement_formateur_siret) {
    formateur = gestionnaire;
  } else {
    formateur = await getEtablissement({
      siret: etablissement_formateur_siret,
    });
  }

  return {
    gestionnaire,
    formateur,
  };
};

const getEstablishmentAddress = (establishment) => {
  if (!establishment) {
    return null;
  }

  const { numero_voie, type_voie, nom_voie } = establishment;
  return [numero_voie, type_voie, nom_voie].filter((val) => val).join(" ");
};

const getEtablissementReference = ({ gestionnaire, formateur }) => {
  // Check etablissement reference found
  if (!gestionnaire && !formateur) {
    logger.error(`getEtablissementReference: both gestionnaire and formateur null`);
    return null;
  }

  let referenceEstablishment = gestionnaire || formateur;

  let etablissement_reference =
    gestionnaire && referenceEstablishment._id === gestionnaire._id ? "gestionnaire" : "formateur";

  // Check if etablissement responsable is conventionne if not take etablissement formateur
  if (
    formateur &&
    gestionnaire &&
    gestionnaire.computed_conventionne !== "OUI" &&
    formateur.computed_conventionne === "OUI"
  ) {
    referenceEstablishment = formateur;
    etablissement_reference = "formateur";
  }

  return {
    referenceEstablishment,
    etablissement_reference,
  };
};

const getGeoloc = ({ gestionnaire, formateur }) => {
  const geo_coordonnees_etablissement_formateur = formateur ? formateur.geo_coordonnees : null;
  const geo_coordonnees_etablissement_gestionnaire = gestionnaire ? gestionnaire.geo_coordonnees : null;

  return {
    geo_coordonnees_etablissement_formateur,
    geo_coordonnees_etablissement_gestionnaire,
    idea_geo_coordonnees_etablissement:
      geo_coordonnees_etablissement_formateur || geo_coordonnees_etablissement_gestionnaire,
  };
};

const mapEtablissementKeys = async (
  etablissement,
  prefix = "etablissement_gestionnaire" || "etablissement_formateur",
  cpMap = {}
) => {
  const { result: cpMapping, messages } =
    cpMap[etablissement.code_postal] || (await codePostalMapper(etablissement.code_postal));

  if (!cpMap[etablissement.code_postal]) {
    cpMap[etablissement.code_postal] = { result: cpMapping, messages };
  }

  const {
    code_postal = null,
    code_commune_insee = null,
    num_departement = null,
    nom_departement = null,
    region = null,
    nom_academie = null,
    num_academie = null,
    localite = null,
  } = cpMapping || {};

  return {
    result: {
      [`${prefix}_siren`]: etablissement.siren || null,
      [`${prefix}_published`]: etablissement.published || false,
      [`${prefix}_catalogue_published`]: etablissement.catalogue_published || false,
      [`${prefix}_id`]: etablissement._id || null,
      [`${prefix}_uai`]: etablissement.uai || null,
      [`${prefix}_enseigne`]: etablissement.enseigne || null,
      [`${prefix}_type`]: etablissement.computed_type || null,
      [`${prefix}_conventionne`]: etablissement.computed_conventionne || null,
      [`${prefix}_declare_prefecture`]: etablissement.computed_declare_prefecture || null,
      [`${prefix}_datadock`]: etablissement.computed_info_datadock || null,
      [`${prefix}_adresse`]: getEstablishmentAddress(etablissement),
      [`${prefix}_complement_adresse`]: etablissement.complement_adresse || null,
      [`${prefix}_cedex`]: etablissement.cedex || null,
      [`${prefix}_entreprise_raison_sociale`]: etablissement.entreprise_raison_sociale || null,

      [`${prefix}_code_postal`]: code_postal,
      [`${prefix}_code_commune_insee`]: code_commune_insee,
      [`${prefix}_num_departement`]: num_departement,
      [`${prefix}_nom_departement`]: nom_departement,
      [`${prefix}_region`]: region,
      [`${prefix}_nom_academie`]: nom_academie,
      [`${prefix}_num_academie`]: num_academie,
      [`${prefix}_localite`]: localite,
    },
    messages,
  };
};

const etablissementsMapper = async (etablissement_gestionnaire_siret, etablissement_formateur_siret, cpMap = {}) => {
  try {
    if (!etablissement_gestionnaire_siret && !etablissement_formateur_siret) {
      throw new Error("etablissementsMapper gestionnaire_siret, formateur_siret  must be provided");
    }

    const attachedEstablishments = await getAttachedEstablishments(
      etablissement_gestionnaire_siret,
      etablissement_formateur_siret
    );

    const etablissementReference = getEtablissementReference(attachedEstablishments);
    if (!etablissementReference) {
      return { result: null, messages: { error: "Unable to retrieve etablissementReference" } };
    }

    const { referenceEstablishment, etablissement_reference } = etablissementReference;

    const {
      result: etablissementGestionnaire,
      messages: etablissementGestionnaireMessages,
    } = await mapEtablissementKeys(attachedEstablishments.gestionnaire || {}, "etablissement_gestionnaire", cpMap);

    const { result: etablissementFormateur, messages: etablissementFormateurMessages } = await mapEtablissementKeys(
      attachedEstablishments.formateur || {},
      "etablissement_formateur",
      cpMap
    );

    const geolocInfo = getGeoloc(attachedEstablishments);

    return {
      result: {
        ...etablissementGestionnaire,
        ...etablissementFormateur,

        etablissement_reference,
        etablissement_reference_catalogue_published: referenceEstablishment.catalogue_published,
        etablissement_reference_published: referenceEstablishment.published,
        etablissement_reference_declare_prefecture: referenceEstablishment.computed_declare_prefecture,
        etablissement_reference_type: referenceEstablishment.computed_type,
        etablissement_reference_conventionne: referenceEstablishment.computed_conventionne,
        etablissement_reference_datadock: referenceEstablishment.computed_info_datadock,

        ...geolocInfo,
      },
      messages: { ...etablissementGestionnaireMessages, ...etablissementFormateurMessages },
    };
  } catch (e) {
    logger.error(e);
    return { result: null, messages: { error: e.toString() } };
  }
};

module.exports = { etablissementsMapper };
