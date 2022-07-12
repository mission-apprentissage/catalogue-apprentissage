// @ts-check

/** @typedef {import("../../common/model/schema/etablissement").Etablissement} Etablissement */
/** @typedef {{Habilitation_Partenaire:string, Siret_Partenaire:string}} Partenaire */
/** @typedef {{certificateur:string, siret_certificateur:string}} Certificateur */
/** @typedef {{code_type_certif:string, rncp_eligible_apprentissage:boolean, partenaires: Partenaire[], certificateurs: Certificateur[]}} RNCPInfo */

const logger = require("../../common/logger");
const { habiliteList } = require("../../constants/certificateurs");
const { Etablissement } = require("../../common/model");

/**
 * Retrieve establishments data from couple of sirets
 *
 * @param {string} etablissement_gestionnaire_siret
 * @param {string} etablissement_formateur_siret
 *
 * @returns {Promise<{gestionnaire: Etablissement, formateur: Etablissement}>}
 */
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

/**
 * Get address of an establishment on one line
 *
 * @param {Etablissement} establishment
 * @returns {null|string}
 */
const getEstablishmentAddress = (establishment) => {
  if (!establishment) {
    return null;
  }

  const { numero_voie, type_voie, nom_voie } = establishment;
  return [numero_voie, type_voie, nom_voie].filter((val) => val).join(" ");
};

/**
 * Check if given siret is in partenaires
 *
 * @param {Partenaire[]} partenaires
 * @param {string} siret
 * @returns {boolean}
 */
const isPartenaire = (partenaires, siret) => {
  return (partenaires ?? []).some(
    ({ Siret_Partenaire, Habilitation_Partenaire }) =>
      Siret_Partenaire === siret && ["HABILITATION_ORGA_FORM", "HABILITATION_FORMER"].includes(Habilitation_Partenaire)
  );
};

/**
 * Check if given siret is in certificateurs
 *
 * @param {Certificateur[]} certificateurs
 * @param {string} siret
 * @returns {boolean}
 */
const isCertificateur = (certificateurs, siret) => {
  return siret && (certificateurs ?? []).some(({ siret_certificateur }) => siret_certificateur === siret);
};

/**
 * Check if given siret is in certificateurs sirens
 *
 * @param {Certificateur[]} certificateurs
 * @param {string} siret
 * @returns {boolean}
 */
const isSirenCertificateur = (certificateurs, siret) => {
  return (
    siret &&
    (certificateurs ?? []).some(
      ({ siret_certificateur = "" }) => siret_certificateur?.substring(0, 9) === siret.substring(0, 9)
    )
  );
};

/**
 * Si la formation est un titre (code_type_certif = Titre ou TP)
 * On regarde pour gestionnaire ou le formateur si l'un des deux est habilité RNCP
 *
 * Habilité :
 *   - soit habilité par défaut (certificateur = ministère du travail)
 *   - soit siret dans la liste des partenaires avec habilitation 'organiser et former' ou 'former'
 *   - soit siret est dans la liste des certificateurs
 *
 * @param {RNCPInfo} rncpInfo
 * @param {string} siret
 * @param {boolean} [checkDefaultHabilitation=true]
 * @returns {boolean}
 */
const isHabiliteRncp = ({ partenaires = [], certificateurs = [] }, siret, checkDefaultHabilitation = true) => {
  if (
    checkDefaultHabilitation &&
    (certificateurs ?? []).some(({ certificateur }) => habiliteList.includes(certificateur))
  ) {
    return true;
  }

  return isPartenaire(partenaires, siret) || isCertificateur(certificateurs, siret);
};

/**
 * Règles pour l'obtention du badge 'Certifié Qualité'.
 * Aujourd'hui, un établissement certifié Qualiopi est certifié Qualité.
 *
 * @param {Etablissement} etablissement
 * @returns {boolean}
 */
const isCertifieQualite = (etablissement) => {
  if (etablissement.info_qualiopi_info === "OUI") {
    return true;
  }

  return false;
};

const getEtablissementReference = ({ gestionnaire, formateur }, rncpInfo) => {
  // Check etablissement reference found
  if (!gestionnaire && !formateur) {
    logger.debug(`getEtablissementReference: both gestionnaire and formateur null`);
    return null;
  }

  let referenceEstablishment = gestionnaire ?? formateur;

  let etablissement_reference =
    gestionnaire && referenceEstablishment._id === gestionnaire._id ? "gestionnaire" : "formateur";

  if (formateur && gestionnaire) {
    // Check if etablissement responsable is conventionne if not take etablissement formateur
    if (gestionnaire.computed_conventionne !== "OUI" && formateur.computed_conventionne === "OUI") {
      referenceEstablishment = formateur;
      etablissement_reference = "formateur";
    }

    // for RNCP formation, take the establishment that is habilite
    if (["Titre", "TP"].includes(rncpInfo?.code_type_certif)) {
      if (isHabiliteRncp(rncpInfo, gestionnaire.siret)) {
        referenceEstablishment = gestionnaire;
        etablissement_reference = "gestionnaire";
      } else if (isHabiliteRncp(rncpInfo, formateur.siret)) {
        referenceEstablishment = formateur;
        etablissement_reference = "formateur";
      }
    }
  }

  return {
    referenceEstablishment,
    etablissement_reference,
  };
};

/**
 * @param {{gestionnaire: Etablissement, formateur: Etablissement}} attachedEstablishments
 */
const getGeoloc = ({ gestionnaire, formateur }) => {
  const geo_coordonnees_etablissement_formateur = formateur?.geo_coordonnees ?? null;
  const geo_coordonnees_etablissement_gestionnaire = gestionnaire?.geo_coordonnees ?? null;

  return {
    geo_coordonnees_etablissement_formateur,
    geo_coordonnees_etablissement_gestionnaire,
  };
};

/**
 * Map etablissement keys for formation
 *
 * @param {Etablissement} etablissement
 * @param {string} prefix
 */
const mapEtablissementKeys = (etablissement, prefix = "etablissement_gestionnaire") => {
  return {
    [`${prefix}_siren`]: etablissement.siren || null,
    [`${prefix}_nda`]: etablissement.nda || null,
    [`${prefix}_published`]: etablissement.published || false,
    [`${prefix}_certifie_qualite`]: etablissement.certifie_qualite || false,
    [`${prefix}_id`]: etablissement._id ? `${etablissement._id}` : null,
    [`${prefix}_uai`]: etablissement.uai || null,
    [`${prefix}_enseigne`]: etablissement.enseigne || null,
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

/**
 * Check if formation should be in "catalogue général" or in "catalogue non-éligible"
 *
 * @param {Etablissement} gestionnaire
 * @param {Etablissement} referenceEstablishment
 * @param {RNCPInfo} rncpInfo
 *
 * @returns {boolean} true if formation should be in "catalogue général"
 */
const isInCatalogGeneral = (gestionnaire, referenceEstablishment, rncpInfo) => {
  /**
   * Les formations dont l'établissement gestionnaire ne possède pas de certification Qualité
   * n'apparraissent pas dans le Catalogue Général (mais dans Non réglementaire) depuis le 31
   * mars 2022 (law change https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044792191)
   */
  if (!isCertifieQualite(gestionnaire)) {
    return false;
  }

  // Si le code_type_certif est Titre ou TP, alors on procède à la vérification de l'habilitation RNCP.
  if (
    ["Titre", "TP"].includes(rncpInfo.code_type_certif) &&
    (!isHabiliteRncp(rncpInfo, referenceEstablishment.siret) || !rncpInfo.rncp_eligible_apprentissage)
  ) {
    return false;
  }

  return true;
};

/**
 * Compute data for France Competence study
 *
 * @param {{gestionnaire: Etablissement, formateur: Etablissement}} attachedEstablishments
 * @param {RNCPInfo} rncpInfo
 */
const getFranceCompetenceInfos = ({ gestionnaire, formateur }, rncpInfo) => {
  const fc_is_habilite_rncp =
    isHabiliteRncp(rncpInfo, gestionnaire?.siret, false) ?? isHabiliteRncp(rncpInfo, formateur?.siret, false);

  const result = {
    fc_is_catalog_general: fc_is_habilite_rncp && rncpInfo.rncp_eligible_apprentissage,
    fc_is_habilite_rncp,
    fc_is_certificateur:
      isCertificateur(rncpInfo.certificateurs, gestionnaire?.siret) ??
      isCertificateur(rncpInfo.certificateurs, formateur?.siret),
    fc_is_certificateur_siren:
      isSirenCertificateur(rncpInfo.certificateurs, gestionnaire?.siret) ??
      isSirenCertificateur(rncpInfo.certificateurs, formateur?.siret),
    fc_is_partenaire:
      isPartenaire(rncpInfo.partenaires, gestionnaire?.siret) ?? isPartenaire(rncpInfo.partenaires, formateur?.siret),
    fc_has_partenaire: rncpInfo.partenaires?.length > 0,
  };

  return result;
};

/**
 * @param {string} etablissement_gestionnaire_siret
 * @param {string} etablissement_formateur_siret
 * @param {RNCPInfo} rncpInfo
 */
const etablissementsMapper = async (etablissement_gestionnaire_siret, etablissement_formateur_siret, rncpInfo) => {
  try {
    if (!etablissement_gestionnaire_siret && !etablissement_formateur_siret) {
      throw new Error("etablissementsMapper gestionnaire_siret, formateur_siret must be provided");
    }

    const attachedEstablishments = await getAttachedEstablishments(
      etablissement_gestionnaire_siret,
      etablissement_formateur_siret
    );

    const etablissementReference = getEtablissementReference(attachedEstablishments, rncpInfo);
    if (!etablissementReference) {
      throw new Error("Unable to retrieve neither gestionnaire and formateur, both are null");
    }

    if (attachedEstablishments?.gestionnaire?.ferme) {
      throw new Error(`Établissement gestionnaire fermé ${etablissement_gestionnaire_siret}`);
    }
    if (!attachedEstablishments?.gestionnaire?._id) {
      throw new Error(`Établissement gestionnaire introuvable ${etablissement_formateur_siret}`);
    }

    if (attachedEstablishments?.formateur?.ferme) {
      throw new Error(`Établissement formateur fermé ${etablissement_formateur_siret}`);
    }
    if (!attachedEstablishments?.formateur?._id) {
      throw new Error(`Établissement formateur introuvable ${etablissement_formateur_siret}`);
    }

    const { referenceEstablishment, etablissement_reference } = etablissementReference;

    const etablissementGestionnaire = mapEtablissementKeys(
      attachedEstablishments.gestionnaire,
      "etablissement_gestionnaire"
    );

    const etablissementFormateur = mapEtablissementKeys(attachedEstablishments.formateur, "etablissement_formateur");

    const geolocInfo = getGeoloc(attachedEstablishments);

    const france_competence_infos = getFranceCompetenceInfos(attachedEstablishments, rncpInfo);

    return {
      result: {
        ...etablissementGestionnaire,
        etablissement_gestionnaire_habilite_rncp: ["Titre", "TP"].includes(rncpInfo?.code_type_certif)
          ? isHabiliteRncp(rncpInfo, etablissement_gestionnaire_siret, true)
          : null,
        etablissement_gestionnaire_certifie_qualite: isCertifieQualite(attachedEstablishments.gestionnaire),

        ...etablissementFormateur,
        etablissement_formateur_habilite_rncp: ["Titre", "TP"].includes(rncpInfo?.code_type_certif)
          ? isHabiliteRncp(rncpInfo, etablissement_formateur_siret, true)
          : null,
        etablissement_formateur_certifie_qualite: isCertifieQualite(attachedEstablishments.formateur),

        etablissement_reference,
        etablissement_reference_published: referenceEstablishment.published,
        etablissement_reference_habilite_rncp: ["Titre", "TP"].includes(rncpInfo?.code_type_certif)
          ? isHabiliteRncp(rncpInfo, referenceEstablishment.siret, true)
          : null,
        etablissement_reference_certifie_qualite: isCertifieQualite(referenceEstablishment),

        catalogue_published: isInCatalogGeneral(attachedEstablishments?.gestionnaire, referenceEstablishment, rncpInfo),

        ...geolocInfo,

        france_competence_infos,
      },
    };
  } catch (e) {
    logger.error(e);
    return { result: null, messages: { error: e.toString() } };
  }
};

module.exports = {
  getAttachedEstablishments,
  getEstablishmentAddress,
  isHabiliteRncp,
  isCertifieQualite,
  getEtablissementReference,
  getGeoloc,
  mapEtablissementKeys,
  isInCatalogGeneral,
  etablissementsMapper,
};
