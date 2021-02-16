const logger = require("../../common/logger");
const { Etablissement } = require("../../common/model");

const getAttachedEstablishments = async (etablissement_gestionnaire_siret, etablissement_formateur_siret) => {
  // Get establishment Gestionnaire
  const gestionnaire = await Etablissement.findOne({
    siret: etablissement_gestionnaire_siret,
  });

  // Get establishment Formateur
  let formateur;
  if (etablissement_gestionnaire_siret === etablissement_formateur_siret) {
    formateur = gestionnaire;
  } else {
    formateur = await Etablissement.findOne({
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

const isHabiliteRncp = ({ partenaires = [], certificateurs = [] }, siret) => {
  const isPartenaire = (partenaires ?? []).some(
    ({ SIRET_PARTENAIRE, HABILITATION_PARTENAIRE }) =>
      SIRET_PARTENAIRE === siret && ["HABILITATION_ORGA_FORM", "HABILITATION_FORMER"].includes(HABILITATION_PARTENAIRE)
  );
  const isCertificateur = (certificateurs ?? []).some(({ SIRET_CERTIFICATEUR }) => SIRET_CERTIFICATEUR === siret);
  return isPartenaire || isCertificateur;
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
  prefix = "etablissement_gestionnaire" || "etablissement_formateur"
) => {
  return {
    [`${prefix}_siren`]: etablissement.siren || null,
    [`${prefix}_published`]: etablissement.published || false,
    [`${prefix}_catalogue_published`]: etablissement.catalogue_published || false,
    [`${prefix}_id`]: etablissement._id ? `${etablissement._id}` : null,
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

    [`${prefix}_code_postal`]: etablissement.code_postal || null,
    [`${prefix}_code_commune_insee`]: etablissement.code_insee_localite || null,
    [`${prefix}_num_departement`]: etablissement.num_departement || null,
    [`${prefix}_nom_departement`]: etablissement.nom_departement || null,
    [`${prefix}_region`]: etablissement.region_implantation_nom || null,
    [`${prefix}_nom_academie`]: etablissement.nom_academie || null,
    [`${prefix}_num_academie`]: etablissement.num_academie ? `${etablissement.num_academie}` : null,
    [`${prefix}_localite`]: etablissement.localite || null,

    [`${prefix}_date_creation`]: etablissement.date_creation || null,
  };
};

const etablissementsMapper = async (etablissement_gestionnaire_siret, etablissement_formateur_siret, rncpInfo) => {
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

    if (attachedEstablishments?.gestionnaire?.ferme) {
      return {
        result: null,
        messages: { error: `Établissement gestionnaire fermé ${etablissement_gestionnaire_siret}` },
      };
    }

    if (attachedEstablishments?.formateur?.ferme) {
      return { result: null, messages: { error: `Établissement formateur fermé ${etablissement_formateur_siret}` } };
    }

    const { referenceEstablishment, etablissement_reference } = etablissementReference;

    const etablissementGestionnaire = await mapEtablissementKeys(
      attachedEstablishments.gestionnaire || {},
      "etablissement_gestionnaire"
    );

    const etablissementFormateur = await mapEtablissementKeys(
      attachedEstablishments.formateur || {},
      "etablissement_formateur"
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
        rncp_etablissement_reference_habilite: isHabiliteRncp(rncpInfo, referenceEstablishment.siret),
        rncp_etablissement_gestionnaire_habilite: isHabiliteRncp(rncpInfo, etablissement_gestionnaire_siret),
        rncp_etablissement_formateur_habilite: isHabiliteRncp(rncpInfo, etablissement_formateur_siret),

        ...geolocInfo,
      },
    };
  } catch (e) {
    logger.error(e);
    return { result: null, messages: { error: e.toString() } };
  }
};

module.exports = { etablissementsMapper };
