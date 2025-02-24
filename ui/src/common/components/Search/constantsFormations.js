import React from "react";

import { escapeDiacritics } from "../../utils/downloadUtils";
import helpText from "../../../locales/helpText.json";
import { CONTEXT } from "../../../constants/context";
// import { departements } from "../../../constants/departements";
import { ANNEES } from "../../../constants/annees";
import { sortDescending } from "../../utils/historyUtils";
import { AffelnetMissingSession } from "./components/AffelnetMissingSession";
import { ParcoursupMissingSession } from "./components/ParcoursupMissingSession";
import { AFFELNET_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";

export const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;
const endpointPublic = process.env.REACT_APP_ENDPOINT_PUBLIC || "https://catalogue-apprentissage.intercariforef.org";

export const allowedFilters = [
  "QUERYBUILDER",
  "SEARCH",
  "affelnet_perimetre_prise_rdv",
  "affelnet_perimetre",
  "affelnet_previous_session",
  "affelnet_previous_statut",
  "affelnet_publication_auto",
  "affelnet_published_date_end",
  "affelnet_published_date_start",
  "affelnet_session",
  "affelnet_statut",
  "affelnet_statut_initial",
  "affelnet_statut_a_definir",
  "agriculture",
  "annee",
  "bcn_mefs_10",
  "bcn_mefs_10_agregat",
  "catalogue_published",
  "cfd_entree",
  "cfd",
  "cle_me_link",
  "cle_ministere_educatif",
  "code_commune_insee",
  "code_postal",
  "date_debut_end",
  "date_debut_start",
  "diplome",
  "duree",
  "etablissement_formateur_actif",
  "etablissement_formateur_siret",
  "etablissement_formateur_uai",
  "etablissement_gestionnaire_actif",
  "etablissement_gestionnaire_num_academie",
  "etablissement_gestionnaire_siren",
  "etablissement_gestionnaire_siret",
  "etablissement_gestionnaire_uai",
  "etablissement_reference_habilite_rncp",
  "habilite",
  "id_action",
  "id_certifinfo",
  "id_formation",
  "ids_action",
  "intitule_court",
  "intitule_long",
  "last_statut_update_date_end",
  "last_statut_update_date_start",
  "niveau",
  "niveau_formation_diplome",
  "libelle_court",
  "nom_academie",
  "nouvelle_fiche",
  "num_academie",
  "num_departement",
  "parcoursup_perimetre_prise_rdv",
  "parcoursup_perimetre",
  "parcoursup_previous_session",
  "parcoursup_previous_statut",
  "parcoursup_publication_auto",
  "parcoursup_published",
  "parcoursup_published_date_end",
  "parcoursup_published_date_start",
  "parcoursup_session",
  "parcoursup_statut",
  "parcoursup_statut_initial",
  "published",
  "qualite",
  "region",
  "rncp_code",
  "rncp_eligible_apprentissage",
  "rome_codes",
  "siret_actif",
  "tags",
  "uai_formation",
  "rejection",
  "rejection.description",
];

const mefsFormatter = (mefs) => {
  return mefs?.map((mef) => `${mef.mef10}`).join(", ") ?? "";
};

const booleanFormatter = (value) => {
  switch (value) {
    case true:
      return "OUI";
    case false:
      return "NON";
    default:
      return "";
  }
};

const publicationFormatter = (value) => {
  switch (value) {
    case true:
      return "automatique";
    case false:
      return "manuelle";
    case null:
    default:
      return "";
  }
};

const mefsExpirationFormatter = (mefs) => {
  return (
    mefs
      ?.map((mef) =>
        mef.date_fermeture
          ? `expire le ${new Date(mef.date_fermeture).toLocaleDateString("fr-FR")}`
          : "pas de date d'expiration"
      )
      .join(", ") ?? ""
  );
};

/**
 * Colonnes inclues dans l'export CSV
 */
export const columnsDefinition = [
  /**
   * Identifiants offre
   */
  {
    Header: "Clé ministere educatif",
    accessor: "cle_ministere_educatif",
    width: 200,
    exportable: true,
  },
  {
    Header: "Fiche catalogue",
    accessor: "cle_ministere_educatif",
    width: 200,
    exportable: true,
    formatter: (value) => `${process.env.REACT_APP_BASE_URL}/formation/${encodeURIComponent(value)}`,
  },

  {
    Header: "Lien catalogue public (Carif-Oref)",
    accessor: "cle_ministere_educatif",
    width: 200,
    exportable: true,
    formatter: (value) => `${endpointPublic}/formation/${encodeURIComponent(value)}`,
  },

  {
    Header: "Identifiant Parcoursup",
    accessor: "parcoursup_id",
    width: 200,
    exportable: true,
  },
  {
    Header: "Identifiant Affelnet",
    accessor: "affelnet_id",
    width: 200,
    exportable: true,
  },
  {
    Header: "Identifiant Carif formation",
    accessor: "id_formation",
    width: 200,
    exportable: true,
  },
  {
    Header: "Identifiant Carif action",
    accessor: "ids_action",
    width: 200,
    exportable: true,
  },
  {
    Header: "Identifiant Certifinfo",
    accessor: "id_certifinfo",
    width: 200,
    exportable: true,
  },

  /**
   * Organismes / localisation
   */
  {
    Header: "Responsable: n° académie",
    accessor: "etablissement_gestionnaire_num_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Responsable: académie",
    accessor: "etablissement_gestionnaire_nom_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Responsable: région",
    accessor: "etablissement_gestionnaire_region",
    width: 200,
    exportable: true,
  },
  {
    Header: "Responsable: Siret",
    accessor: "etablissement_gestionnaire_siret",
    width: 200,
    exportable: true,
    editorInput: "text",
  },
  {
    Header: "Responsable: UAI",
    accessor: "etablissement_gestionnaire_uai",
    width: 200,
    exportable: true,
  },
  {
    Header: "Responsable: raison sociale",
    accessor: "etablissement_gestionnaire_entreprise_raison_sociale",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Responsable: enseigne",
    accessor: "etablissement_gestionnaire_enseigne",
    width: 200,
    exportable: true,
  },

  {
    Header: "Formateur: n° académie",
    accessor: "etablissement_formateur_num_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formateur: académie",
    accessor: "etablissement_formateur_nom_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formateur: région",
    accessor: "etablissement_formateur_region",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formateur: Siret",
    accessor: "etablissement_formateur_siret",
    width: 200,
    exportable: true,
    editorInput: "text",
  },
  {
    Header: "Formateur: UAI",
    accessor: "etablissement_formateur_uai",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formateur: raison sociale",
    accessor: "etablissement_formateur_entreprise_raison_sociale",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Formateur: enseigne",
    accessor: "etablissement_formateur_enseigne",
    width: 200,
    exportable: true,
  },

  {
    Header: "Formateur: adresse",
    accessor: "etablissement_formateur_adresse",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formateur: code postal",
    accessor: "etablissement_formateur_code_postal",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formateur: ville",
    accessor: "etablissement_formateur_localite",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formateur: code commune",
    accessor: "etablissement_formateur_code_commune_insee",
    width: 200,
    exportable: true,
  },

  {
    Header: "Lieu: n° académie",
    accessor: "num_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: académie",
    accessor: "nom_academie",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Lieu: région",
    accessor: "region",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: Siret",
    accessor: "etablissement_lieu_formation_siret",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: Siret actif ?",
    accessor: "etablissement_lieu_siret_actif",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: UAI transmis par RCO",
    accessor: "etablissement_lieu_formation_uai",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: UAI",
    accessor: "uai_formation",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: UAI édité ?",
    accessor: "editedFields.uai_formation",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? "Oui" : "Non"),
  },
  {
    Header: "Lieu: UAI date d'édition",
    accessor: "updates_history",
    width: 200,
    exportable: true,
    formatter: (value) => {
      const uai_updated_history = value?.filter((value) => !!value.to?.uai_formation)?.sort(sortDescending);

      return uai_updated_history?.length
        ? new Date(uai_updated_history[0]?.updated_at).toLocaleDateString("fr-FR")
        : "";
    },
  },
  {
    Header: "Lieu: UAI édité par",
    accessor: "updates_history",
    width: 200,
    exportable: true,
    formatter: (value) => {
      const uai_updated_history = value?.filter((value) => !!value.to?.uai_formation)?.sort(sortDescending);

      return uai_updated_history?.length ? uai_updated_history[0]?.to.last_update_who : "";
    },
  },

  {
    Header: "Lieu: adresse",
    accessor: "lieu_formation_adresse",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Lieu: code postal",
    accessor: "code_postal",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: ville",
    accessor: "localite",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Lieu: code commune",
    accessor: "code_commune_insee",
    width: 200,
    exportable: true,
  },
  {
    Header: "Lieu: géolocalisation",
    accessor: "lieu_formation_geo_coordonnees",
    width: 200,
    exportable: true,
  },

  {
    Header: "Lieu: Distance entre lieu et formateur",
    accessor: "distance_lieu_formation_etablissement_formateur",
    width: 200,
    exportable: true,
  },

  /**
   * Formation
   */

  {
    Header: "Formation: type certification BCN",
    accessor: "diplome",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formation: type certification RNCP",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value?.type_certif),
  },
  {
    Header: "Formation: code type certification RNCP",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value?.code_type_certif),
  },
  {
    Header: "Formation: libellé long BCN",
    accessor: "intitule_long",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formation: libellé RNCP",
    accessor: "rncp_intitule",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Formation: libellé Carif-Oref",
    accessor: "intitule_rco",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formation: type d'enregistrement (certifinfo)",
    accessor: "CI_inscrit_rncp",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },

  {
    Header: "Formation: type d'enregistrement (France compétences)",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value?.type_enregistrement),
  },
  {
    Header: "Formation: contrôle d'expiration sur le code",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => {
      switch (value?.type_enregistrement) {
        case "Enregistrement de droit":
          return "CFD";
        case "Enregistrement sur demande":
          return "RNCP";
        default:
          return "";
      }
    },
  },
  {
    Header: "Formation: code RNCP",
    accessor: "rncp_code",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formation: code RNCP expiration",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) =>
      value?.date_fin_validite_enregistrement
        ? new Date(value.date_fin_validite_enregistrement).toLocaleDateString("fr-FR")
        : "",
  },

  {
    Header: "Formation: code CFD",
    accessor: "cfd",
    width: 400,
    exportable: true,
  },
  {
    Header: "Formation: code CFD expiration",
    accessor: "cfd_date_fermeture",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : ""),
  },
  {
    Header: "Formation: code CFD de l'année d'entrée",
    accessor: "cfd_entree",
    width: 400,
    exportable: true,
  },
  {
    Header: "Formation: code CFD de l'année d'entrée expiration",
    accessor: "cfd_entree_date_fermeture",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : ""),
  },
  {
    Header: "Formation: codes MEF",
    accessor: "bcn_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsFormatter,
  },
  {
    Header: "Formation: codes MEF expirations",
    accessor: "bcn_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsExpirationFormatter,
  },
  {
    Header: "Formation: MEF dans le périmètre Affelnet",
    accessor: "affelnet_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsFormatter,
  },
  {
    Header: "Formation: MEF dans le périmètre Affelnet expiration",
    accessor: "affelnet_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsExpirationFormatter,
  },
  {
    Header: "Formation: MEF dans le périmètre Parcoursup",
    accessor: "parcoursup_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsFormatter,
  },
  {
    Header: "Formation: MEF dans le périmètre Parcoursup expiration",
    accessor: "parcoursup_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsExpirationFormatter,
  },
  {
    Header: "Formation: niveau BCN",
    accessor: "niveau",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Formation: durée collectée",
    accessor: "duree",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formation: année d'entrée en apprentissage collectée",
    accessor: "annee",
    width: 200,
    exportable: true,
  },
  {
    Header: "Formation: URL Onisep",
    accessor: "onisep_url",
    width: 300,
    exportable: true,
  },

  /**
   * Offres / paramètres réglementaires
   */
  {
    Header: "Paramètre réglementaire: Offre réglementaire ?",
    accessor: "catalogue_published",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Paramètre réglementaire: certifié qualité ?",
    accessor: "etablissement_gestionnaire_certifie_qualite",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Paramètre réglementaire: Formateur certifié qualité ?",
    accessor: "etablissement_formateur_certifie_qualite",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },

  {
    Header: "Paramètre réglementaire: Organisme habilité pour ce RNCP ?",
    accessor: "etablissement_reference_habilite_rncp",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Paramètre réglementaire: Siret formateur et responsable actif ?",
    accessor: "siret_actif",
    width: 200,
    exportable: true,
  },
  {
    Header: "Paramètre réglementaire: Siret responsable actif",
    accessor: "etablissement_gestionnaire_actif",
    width: 200,
    exportable: true,
  },
  {
    Header: "Paramètre réglementaire: Siret formateur actif",
    accessor: "etablissement_formateur_actif",
    width: 200,
    exportable: true,
  },
  {
    Header: "Paramètre réglementaire: Formation état fiche RNCP",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value?.active_inactive),
  },

  /**
   * Périmètre Affelnet
   */
  {
    Header: "Affelnet: type de publication",
    accessor: "affelnet_publication_auto",
    width: 200,
    exportable: true,
    formatter: publicationFormatter,
  },
  {
    Header: " Affelnet: dernière action par",
    accessor: "updates_history",
    width: 200,
    exportable: true,
    admin: true,
    formatter: (values) =>
      values
        ?.filter(
          (history) =>
            !![AFFELNET_STATUS.NON_PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION].includes(history?.to?.affelnet_statut)
        )
        ?.sort(sortDescending)?.[0]?.to?.last_update_who ?? "",
  },

  {
    Header: "Affelnet: périmètre",
    accessor: "affelnet_perimetre",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Affelnet: statut",
    accessor: "affelnet_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Affelnet: statut initial",
    accessor: "affelnet_statut_initial",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Affelnet: règle académique",
    accessor: "affelnet_statut_a_definir",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Affelnet: statut sur la précédente campagne",
    accessor: "affelnet_previous_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Affelnet: Périmètre prise de rendez-vous LBA",
    accessor: "affelnet_perimetre_prise_rdv",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },

  {
    Header: "Affelnet: session sur la campagne actuelle",
    accessor: "affelnet_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Affelnet: session sur la précédente campagne",
    accessor: "affelnet_previous_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Affelnet: information",
    accessor: "affelnet_infos_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Affelnet: information (url)",
    accessor: "affelnet_url_infos_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Affelnet: modalités particulières",
    accessor: "affelnet_modalites_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Affelnet: modalités particulières (url)",
    accessor: "affelnet_url_modalites_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Affelnet: motif de non publication",
    accessor: "affelnet_raison_depublication",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },

  /**
   * Périmètre Parcoursup
   */
  {
    Header: "Parcoursup: type de publication",
    accessor: "parcoursup_publication_auto",
    width: 200,
    exportable: true,
    formatter: publicationFormatter,
  },
  {
    Header: " Parcoursup: dernière action par",
    accessor: "updates_history",
    width: 200,
    exportable: true,
    admin: true,
    formatter: (values) =>
      values
        ?.filter(
          (history) =>
            !![PARCOURSUP_STATUS.NON_PUBLIE, PARCOURSUP_STATUS.PRET_POUR_INTEGRATION].includes(
              history?.to?.parcoursup_statut
            )
        )
        ?.sort(sortDescending)?.[0]?.to?.last_update_who ?? "",
  },
  {
    Header: "Parcoursup: périmètre",
    accessor: "parcoursup_perimetre",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Parcoursup: statut",
    accessor: "parcoursup_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },

  {
    Header: "Parcoursup: visible moteur de recherche",
    accessor: "parcoursup_published",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },

  {
    Header: "Parcoursup: statut initial",
    accessor: "parcoursup_statut_initial",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },

  {
    Header: "Parcoursup: Périmètre prise de rendez-vous LBA",
    accessor: "parcoursup_perimetre_prise_rdv",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Parcoursup: statut sur la précédente campagne",
    accessor: "parcoursup_previous_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Parcoursup: session sur la campagne actuelle",
    accessor: "parcoursup_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Parcoursup: session sur la précédente campagne",
    accessor: "parcoursup_previous_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Parcoursup: date du dernier envoi",
    accessor: "parcoursup_export_date",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : ""),
  },
  {
    Header: "Parcoursup: motif de non publication",
    accessor: "parcoursup_raison_depublication",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Parcoursup: motif de rejet webservice",
    accessor: "parcoursup_error",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Parcoursup: libellé de rejet webservice",
    accessor: "rejection.description",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Parcoursup: motif de réinitialisation Moss",
    accessor: "parcoursup_statut_reinitialisation",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value?.comment),
  },
  {
    Header: "Parcoursup: date de réinitialisation Moss",
    accessor: "parcoursup_statut_reinitialisation",
    width: 200,
    exportable: true,
    formatter: (value) => (value?.date ? new Date(value?.date).toLocaleDateString("fr-FR") : ""),
  },

  /**
   * Offre détail
   */

  {
    Header: "Offre: Nouvelle fiche",
    accessor: "nouvelle_fiche",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },

  {
    Header: "Offre: Dates de formation",
    accessor: "date_debut",
    width: 200,
    exportable: true,
    formatter: (date_debut, formation) => {
      const dates = formation.date_debut
        ?.map((date_debut, index) => ({
          date_debut,
          date_fin: formation.date_fin ? formation.date_fin[index] : null,
          modalites_entrees_sorties: formation.modalites_entrees_sorties
            ? formation.modalites_entrees_sorties[index]
            : null,
        }))
        .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));

      return dates
        ?.map(
          ({ date_debut, date_fin, modalites_entrees_sorties }) =>
            `Du ${new Date(date_debut).toLocaleDateString("fr-FR")} au ${new Date(date_fin).toLocaleDateString(
              "fr-FR"
            )}${modalites_entrees_sorties ? " en entrée-sortie permanente." : "."}`
        )
        ?.join(" ");
    },
  },
  {
    Header: "Offre: Tags",
    accessor: "tags",
    width: 200,
    exportable: true,
    formatter: (tags) => tags?.sort((a, b) => a - b),
  },
  {
    Header: "Offre: Capacite",
    accessor: "capacite",
    width: 200,
    exportable: true,
  },

  {
    Header: "Offre: Remplace la clé ME",
    accessor: "cle_me_remplace",
    width: 200,
    exportable: true,
    formatter: (value) => (value instanceof Array && value?.join(", ")) ?? "",
  },
  {
    Header: "Offre: Est remplacée par la clé ME",
    accessor: "cle_me_remplace_par",
    width: 200,
    exportable: true,
    formatter: (value) => (value instanceof Array && value?.join(", ")) ?? "",
  },
];

/**
 * Champs de la recherche avancée
 */
export const queryBuilderField = [
  {
    text: "Organisme - Raison sociale du responsable",
    value: "etablissement_gestionnaire_raison_sociale_enseigne.keyword",
  },
  {
    text: "Organisme - Raison sociale du formateur",
    value: "etablissement_formateur_raison_sociale_enseigne.keyword",
  },
  { text: "Organisme - Siret du responsable", value: "etablissement_gestionnaire_siret.keyword" },
  { text: "Organisme - Siret du formateur", value: "etablissement_formateur_siret.keyword" },
  { text: "Organisme - Siret du lieu de formation", value: "etablissement_lieu_formation_siret.keyword" },
  { text: "Organisme - UAI du responsable", value: "etablissement_gestionnaire_uai.keyword" },
  { text: "Organisme - UAI du formateur", value: "etablissement_formateur_uai.keyword" },
  { text: "Organisme - UAI du lieu de formation", value: "uai_formation.keyword" },
  { text: "Localisation - Région du lieu de formation", value: "region.keyword" },
  { text: "Localisation - Département du lieu de formation", value: "nom_departement.keyword" },
  { text: "Localisation - Commune du lieu de formation", value: "localite.keyword" },
  { text: "Formation - Intitulé de la formation", value: "intitule_long.keyword" },
  { text: "Formation - Code RNCP", value: "rncp_code.keyword" },
  { text: "Formation - Code formation diplôme (CFD)", value: "cfd.keyword" },
  { text: "Formation - CFD de la première année", value: "cfd_entree.keyword" },
  { text: "Formation - Code MEF 10 caractères", value: "bcn_mefs_10.mef10.keyword" },
  { text: "Formation - Code Certif Info", value: "id_certifinfo.keyword" },
  { text: "Formation - Type de la formation (ex: Bac professionnel)", value: "diplome.keyword" },
  { text: "Formation - Niveau formation diplôme (ex : '320' pour BTS)", value: "niveau_formation_diplome.keyword" },
  { text: "Formation - Libellé court (ex : 'BTS')", value: "libelle_court.keyword" },
];

/**
 * Champs de la recherche rapide
 */
export const quickFiltersDefinition = [
  {
    componentId: `region`,
    dataField: "region.keyword",
    title: "Région",
    filterLabel: "Région",
    selectAllLabel: "Toutes les régions",
    sortBy: "asc",
  },
  {
    componentId: `nom_academie`,
    type: "facet",
    dataField: "nom_academie.keyword",
    title: "Académie",
    filterLabel: "Académie",
    selectAllLabel: "Toutes les académies",
    sortBy: "asc",
  },

  { type: "divider", acl: "page_catalogue/voir_filtres_ps" },

  {
    componentId: `parcoursup_perimetre`,
    type: "facet",
    dataField: "parcoursup_perimetre",
    title: "Dans le périmètre Parcoursup",
    filterLabel: "Dans le périmètre Parcoursup",
    selectAllLabel: "Tous",
    sortBy: "desc",
    acl: "page_catalogue/voir_filtres_ps",
    helpTextSection: helpText.search.parcoursup_perimetre,
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1 && values[0] !== "Tous") {
        return {
          query: {
            match: {
              parcoursup_perimetre: values[0] === "Oui",
            },
          },
        };
      }
      return {};
    },
  },

  {
    componentId: `parcoursup_statut`,
    type: "facet",
    dataField: "parcoursup_statut.keyword",
    title: "Statut Parcoursup",
    filterLabel: "Statut Parcoursup",
    selectAllLabel: "Tous",
    sortBy: "desc",
    acl: "page_catalogue/voir_filtres_ps",
    helpTextSection: helpText.search.parcoursup_statut,
  },

  {
    componentId: `parcoursup_previous_statut`,
    type: "facet",
    dataField: "parcoursup_previous_statut.keyword",
    title: "Statut sur la précédente campagne ",
    filterLabel: "Statut sur la précédente campagne Parcoursup ",
    selectAllLabel: "Tous",
    sortBy: "count",
    acl: "page_catalogue/voir_filtres_ps",
    helpTextSection: helpText.search.parcoursup_previous_statut,
  },

  {
    componentId: `parcoursup_publication_auto`,
    type: "facet",
    dataField: "parcoursup_publication_auto",
    title: "Publication automatique",
    filterLabel: "Publication automatique Parcoursup",
    acl: "page_catalogue/voir_filtres_ps",
    sortBy: "desc",
    transformData: (data) => {
      return data.map((d) => ({
        ...d,
        key: {
          1: "Oui",
          0: "Non",
          null: "Pas d'information",
        }[d.key],
      }));
    },
    customQuery: (values) => {
      if (values.length && !values.includes("Tous")) {
        return {
          query: {
            terms: {
              parcoursup_publication_auto: values.map(
                (value) => ({ Oui: true, Non: false, "Pas d'information": null })[value]
              ),
            },
          },
        };
      }
      return {};
    },
  },

  {
    componentId: `parcoursup_session_manquante`,
    type: "component",
    component: <ParcoursupMissingSession />,
    acl: "page_catalogue/voir_filtres_avances_ps",
  },

  {
    type: "advanced",
    openText: "Voir moins de filtres Parcoursup",
    closeText: "Voir plus de filtres Parcoursup",
    acl: "page_catalogue/voir_filtres_avances_ps",
    filters: [
      {
        componentId: `parcoursup_session`,
        type: "facet",
        dataField: "parcoursup_session",
        title: "Session sur la campagne",
        filterLabel: "Session sur la campagne Parcoursup",
        selectAllLabel: "Tous",
        sortBy: "desc",
        displayInContext: [CONTEXT.CATALOGUE_GENERAL],
        helpTextSection: helpText.search.parcoursup_session,

        transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
        customQuery: (values) => {
          if (values.length === 1 && values[0] !== "Tous") {
            return {
              query: {
                match: {
                  parcoursup_session: values[0] === "Oui",
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `parcoursup_previous_session`,
        type: "facet",
        dataField: "parcoursup_previous_session",
        title: "Session sur la précédente campagne",
        filterLabel: "Session sur la précédente campagne Parcoursup",
        selectAllLabel: "Tous",
        sortBy: "desc",
        displayInContext: [CONTEXT.CATALOGUE_GENERAL],
        helpTextSection: helpText.search.parcoursup_previous_session,

        transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
        customQuery: (values) => {
          if (values.length === 1 && values[0] !== "Tous") {
            return {
              query: {
                match: {
                  parcoursup_previous_session: values[0] === "Oui",
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `parcoursup_published_date`,
        type: "date-range",
        dataField: "parcoursup_published_date",
        title: "Date de publication",
        filterLabel: "Publication Parcoursup",
      },

      {
        componentId: `parcoursup_published`,
        type: "facet",
        dataField: "parcoursup_published",
        title: "Visible moteur de recherche",
        filterLabel: "Visible moteur de recherche Parcoursup",
        sortBy: "desc",
        transformData: (data) => {
          return data.map((d) => ({
            ...d,
            key: {
              1: "Oui",
              0: "Non",
              null: "Pas d'information",
            }[d.key],
          }));
        },
        customQuery: (values) => {
          if (values.length && !values.includes("Tous")) {
            return {
              query: {
                terms: {
                  parcoursup_published: values.map(
                    (value) => ({ Oui: true, Non: false, "Pas d'information": null })[value]
                  ),
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `parcoursup_statut_initial`,
        type: "facet",
        dataField: "parcoursup_statut_initial.keyword",
        title: "Statut initial",
        filterLabel: "Statut initial Parcoursup",
        selectAllLabel: "Tous",
        sortBy: "count",
        acl: "page_catalogue/voir_filtres_avances_ps",
      },

      {
        componentId: `rejection.description`,
        type: "facet",
        dataField: "rejection.description.keyword",
        title: "Libellé de rejet Parcoursup",
        filterLabel: "Libellé de rejet Parcoursup",
        selectAllLabel: "Tous",
        sortBy: "count",
        acl: "page_catalogue/voir_filtres_avances_ps",
      },
    ],
  },

  { type: "divider", acl: "page_catalogue/voir_filtres_aff" },

  {
    componentId: `affelnet_perimetre`,
    type: "facet",
    dataField: "affelnet_perimetre",
    title: "Dans le périmètre Affelnet",
    filterLabel: "Dans le périmètre Affelnet",
    selectAllLabel: "Tous",
    sortBy: "desc",
    acl: "page_catalogue/voir_filtres_aff",
    helpTextSection: helpText.search.affelnet_perimetre,
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1 && values[0] !== "Tous") {
        return {
          query: {
            match: {
              affelnet_perimetre: values[0] === "Oui",
            },
          },
        };
      }
      return {};
    },
  },

  {
    componentId: `affelnet_statut`,
    type: "facet",
    dataField: "affelnet_statut.keyword",
    title: "Statut Affelnet",
    filterLabel: "Statut Affelnet",
    selectAllLabel: "Tous",
    sortBy: "desc",
    acl: "page_catalogue/voir_filtres_aff",
    helpTextSection: helpText.search.affelnet_statut,
  },

  {
    componentId: `affelnet_previous_statut`,
    type: "facet",
    dataField: "affelnet_previous_statut.keyword",
    title: "Statut sur la précédente campagne",
    filterLabel: "Statut sur la précédente campagne Affelnet",
    selectAllLabel: "Tous",
    sortBy: "count",
    acl: "page_catalogue/voir_filtres_aff",
    helpTextSection: helpText.search.affelnet_previous_statut,
  },

  {
    componentId: `affelnet_publication_auto`,
    type: "facet",
    dataField: "affelnet_publication_auto",
    title: "Publication automatique",
    filterLabel: "Publication automatique Affelnet",
    acl: "page_catalogue/voir_filtres_aff",
    sortBy: "desc",
    transformData: (data) =>
      data.map((d) => ({
        ...d,
        key: {
          1: "Oui",
          0: "Non",
          null: "Pas d'information",
        }[d.key],
      })),
    customQuery: (values) => {
      if (values.length && !values.includes("Tous")) {
        return {
          query: {
            terms: {
              affelnet_publication_auto: values.map(
                (value) => ({ Oui: true, Non: false, "Pas d'information": null })[value]
              ),
            },
          },
        };
      }
      return {};
    },
  },

  {
    componentId: `affelnet_session_manquante`,
    type: "component",
    component: <AffelnetMissingSession />,
    acl: "page_catalogue/voir_filtres_avances_aff",
  },

  {
    type: "advanced",
    openText: "Voir moins de filtres Affelnet",
    closeText: "Voir plus de filtres Affelnet",
    acl: "page_catalogue/voir_filtres_avances_aff",
    filters: [
      {
        componentId: `affelnet_statut_a_definir`,
        type: "facet",
        dataField: "affelnet_statut_a_definir",
        title: "Règle académique Affelnet",
        filterLabel: "Règle académique Affelnet",
        selectAllLabel: "Tous",
        sortBy: "desc",
        acl: "page_catalogue/voir_filtres_aff",
        displayInContext: [CONTEXT.CATALOGUE_GENERAL],
        helpTextSection: helpText.search.affelnet_statut_a_definir,
        transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
        customQuery: (values) => {
          if (values.length === 1 && values[0] !== "Tous") {
            return {
              query: {
                match: {
                  affelnet_statut_a_definir: values[0] === "Oui",
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `affelnet_session`,
        type: "facet",
        dataField: "affelnet_session",
        title: "Session sur la campagne",
        filterLabel: "Session sur la campagne Affelnet",
        selectAllLabel: "Tous",
        sortBy: "desc",
        displayInContext: [CONTEXT.CATALOGUE_GENERAL],
        helpTextSection: helpText.search.affelnet_session,

        transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
        customQuery: (values) => {
          if (values.length === 1 && values[0] !== "Tous") {
            return {
              query: {
                match: {
                  affelnet_session: values[0] === "Oui",
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `affelnet_previous_session`,
        type: "facet",
        dataField: "affelnet_previous_session",
        title: "Session sur la précédente campagne",
        filterLabel: "Session sur la précédente campagne Affelnet",
        selectAllLabel: "Tous",
        sortBy: "desc",
        displayInContext: [CONTEXT.CATALOGUE_GENERAL],
        helpTextSection: helpText.search.affelnet_previous_session,

        transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
        customQuery: (values) => {
          if (values.length === 1 && values[0] !== "Tous") {
            return {
              query: {
                match: {
                  affelnet_previous_session: values[0] === "Oui",
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `affelnet_published_date`,
        type: "date-range",
        dataField: "affelnet_published_date",
        title: "Date de publication",
        filterLabel: "Publication Affelnet",
      },

      //     {
      //       componentId: `affelnet_perimetre_prise_rdv`,
      //       type: "facet",
      //       dataField: "affelnet_perimetre_prise_rdv",
      //       title: "Visible SLA",
      //       filterLabel: "Visible SLA Affelnet",
      //       sortBy: "desc",
      //       transformData: (data) =>
      //         data.map((d) => ({
      //           ...d,
      //           key: {
      //             1: "Oui",
      //             0: "Non",
      //             null: "Pas d'information",
      //           }[d.key],
      //         })),
      //       customQuery: (values) => {
      //         if (values.length && !values.includes("Tous")) {
      //           return {
      //             query: {
      //               terms: {
      //                 affelnet_perimetre_prise_rdv: values.map(
      //                   (value) => ({ Oui: true, Non: false, "Pas d'information": null })[value]
      //                 ),
      //               },
      //             },
      //           };
      //         }
      //         return {};
      //       },
      //     },

      {
        componentId: `affelnet_statut_initial`,
        type: "facet",
        dataField: "affelnet_statut_initial.keyword",
        title: "Statut initial",
        filterLabel: "Statut initial Affelnet",
        selectAllLabel: "Tous",
        sortBy: "count",
        acl: "page_catalogue/voir_filtres_avances_aff",
      },
    ],
  },

  { type: "divider" },

  {
    componentId: `qualite`,
    type: "facet",
    dataField: "etablissement_gestionnaire_certifie_qualite",
    title: "Certifié Qualité",
    filterLabel: "Certifié Qualité",
    sortBy: "desc",
    helpTextSection: helpText.search.qualite,
    showSearch: false,
    displayInContext: [CONTEXT.CATALOGUE_NON_ELIGIBLE],
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1 && values[0] !== "Tous") {
        return {
          query: {
            match: {
              etablissement_gestionnaire_certifie_qualite: values[0] === "Oui",
            },
          },
        };
      }
      return {};
    },
  },
  {
    componentId: `habilite`,
    type: "facet",
    dataField: "etablissement_reference_habilite_rncp",
    title: "Habilité RNCP",
    filterLabel: "Habilité RNCP",
    sortBy: "desc",
    showSearch: false,
    displayInContext: [CONTEXT.CATALOGUE_NON_ELIGIBLE],
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1 && values[0] !== "Tous") {
        return {
          query: {
            match: {
              etablissement_reference_habilite_rncp: values[0] === "Oui",
            },
          },
        };
      }
      return {};
    },
  },
  {
    componentId: `siret_actif`,
    type: "facet",
    dataField: "siret_actif.keyword",
    title: "Statut du SIRET",
    filterLabel: "Statut du SIRET",
    displayInContext: [CONTEXT.CATALOGUE_NON_ELIGIBLE],
    selectAllLabel: "Tous les statuts",
    sortBy: "asc",
  },

  {
    componentId: `agriculture`,
    type: "facet",
    dataField: "agriculture",
    title: "Formations agricoles",
    filterLabel: "Formations agricoles",
    selectAllLabel: "Toutes les formations",
    sortBy: "asc",
    transformData: (data) =>
      data.map((d) => ({
        ...d,
        key: {
          1: "Oui",
          0: "Non",
          null: "Pas d'information",
        }[d.key],
      })),
    customQuery: (values) => {
      if (values.length && !values.includes("Tous")) {
        return {
          query: {
            terms: {
              agriculture: values.map((value) => ({ Oui: true, Non: false, "Pas d'information": null })[value]),
            },
          },
        };
      }
      return {};
    },
  },

  {
    componentId: `niveau`,
    type: "facet",
    dataField: "niveau.keyword",
    title: "Niveau visé",
    filterLabel: "Niveau visé",
    selectAllLabel: "Tous les niveaux",
    sortBy: "asc",
  },

  {
    componentId: `last_statut_update_date`,
    type: "date-range",
    dataField: "last_statut_update_date",
    title: "Dernière mise à jour du statut",
    filterLabel: "Statut modifié",
  },

  {
    componentId: `date_debut`,
    type: "date-range",
    dataField: "date_debut",
    title: "Date de début de formation",
    filterLabel: "Début de formation",
    helpTextSection: helpText.search.periode.title,
  },

  {
    type: "advanced",
    openText: "Masquer les filtres avancés (niveau, durée, dates...)",
    closeText: "Filtres avancés (niveau, durée, dates...)",
    acl: "page_catalogue/voir_filtres_avances_generaux",
    filters: [
      // {
      //   componentId: `num_departement`,
      //   type: "facet",
      //   dataField: "num_departement.keyword",
      //   title: "Département",
      //   filterLabel: "Département",
      //   selectAllLabel: "Tous",
      //   sortBy: "asc",
      //   size: Object.values(departements).length,
      //   transformData: (data) => data.map((d) => ({ ...d, key: `${d.key} - ${departements[d.key]}` })),
      //   customQuery: (values) => ({
      //     query: values?.length && {
      //       terms: {
      //         "num_departement.keyword": values?.map((value) =>
      //           typeof value === "string" ? value?.split(" - ")[0] : value
      //         ),
      //       },
      //     },
      //   }),
      // },

      {
        componentId: `tags`,
        type: "facet",
        dataField: "tags.keyword",
        title: "Début de formation (année)",
        filterLabel: "Début de formation (année)",
        selectAllLabel: "Toutes",
        sortBy: "asc",
      },
      {
        componentId: `annee`,
        type: "facet",
        dataField: "annee.keyword",
        title: "Année d'entrée en apprentissage",
        filterLabel: "Année d'entrée en apprentissage",
        selectAllLabel: "Toutes",
        sortBy: "asc",
        isAuth: true, // hide for anonymous
        transformData: (data) => data.map((d) => ({ ...d, key: ANNEES[d.key] })),
        customQuery: (values) => ({
          query: values?.length && {
            terms: {
              "annee.keyword": values?.map((value) => Object.keys(ANNEES).find((annee) => ANNEES[annee] === value)),
            },
          },
        }),
      },
      {
        componentId: `duree`,
        type: "facet",
        dataField: "duree.keyword",
        title: "Durée de la formation",
        filterLabel: "Durée de la formation",
        selectAllLabel: "Toutes",
        sortBy: "asc",
        isAuth: true, // hide for anonymous
        transformData: (data) => data.map((d) => ({ ...d, key: d.key <= 1 ? `${d.key} an` : `${d.key} ans` })),
        customQuery: (values) => ({
          query: values?.length && {
            terms: {
              "duree.keyword": values?.map((value) => (typeof value === "string" ? value?.split(" ")[0] : value)),
            },
          },
        }),
      },

      {
        componentId: `nouvelle_fiche`,
        type: "facet",
        dataField: "nouvelle_fiche",
        title: "Nouvelle fiche",
        filterLabel: "Nouvelle fiche",
        sortBy: "desc",
        transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
        customQuery: (values) => {
          if (values.length === 1 && values[0] !== "Tous") {
            return {
              query: {
                match: {
                  nouvelle_fiche: values[0] === "Oui",
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `cle_me_link`,
        type: "facet",
        dataField: "cle_me_link.keyword",
        title: "Liens entre fiches",
        filterLabel: "Liens entre fiches",
        selectAllLabel: "Tous les liens",
        sortBy: "asc",
      },
    ],
  },
];

export const dataSearch = {
  dataField: [
    "intitule_long",
    "etablissement_gestionnaire_raison_sociale_enseigne",
    "etablissement_formateur_raison_sociale_enseigne",
    "cfd",
    "cfd_entree",
    "rncp_code",
    "etablissement_lieu_formation_siret",
    "uai_formation",
    "etablissement_gestionnaire_uai",
    "etablissement_formateur_uai",
    "etablissement_gestionnaire_siret",
    "etablissement_formateur_siret",
    "bcn_mefs_10_agregat",
    "id_formation",
    "id_action",
    "ids_action",
    "id_certifinfo",
    "cle_ministere_educatif",
    "parcoursup_id",
    "affelnet_id",
  ],
  placeholder: "Saisissez votre recherche",
  fieldWeights: [5, 4, 4, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1],
};

export default {
  allowedFilters,
  columnsDefinition,
  quickFiltersDefinition,
  queryBuilderField,
  dataSearch,
};
