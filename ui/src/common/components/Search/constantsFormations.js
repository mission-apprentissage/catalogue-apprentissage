import React from "react";

import { escapeDiacritics } from "../../utils/downloadUtils";
import helpText from "../../../locales/helpText.json";
import { CONTEXT } from "../../../constants/context";
import { departements } from "../../../constants/departements";
import { annees } from "../../../constants/annees";
import { sortDescending } from "../../utils/historyUtils";
import { AffelnetMissingSession } from "./components/AffelnetMissingSession";
import { ParcoursupMissingSession } from "./components/ParcoursupMissingSession";

export const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const allowedFilters = [
  "QUERYBUILDER",
  "SEARCH",
  "etablissement_formateur_siret",
  "etablissement_formateur_actif",
  "etablissement_gestionnaire_siret",
  "etablissement_gestionnaire_actif",
  "siret_actif",
  "num_academie",
  "niveau",
  "etablissement_gestionnaire_siren",
  "cfd",
  "cfd_entree",
  "num_departement",
  "nom_academie",
  "etablissement_gestionnaire_num_academie",
  "uai_formation",
  "code_postal",
  "code_commune_insee",
  "catalogue_published",
  "published",
  "etablissement_gestionnaire_uai",
  "etablissement_formateur_uai",
  "intitule_long",
  "intitule_court",
  "rncp_eligible_apprentissage",
  "etablissement_reference_habilite_rncp",
  "rome_codes",
  "rncp_code",
  "bcn_mefs_10",
  "parcoursup_perimetre",
  "parcoursup_statut",
  "parcoursup_previous_statut",
  "parcoursup_session",
  "parcoursup_previous_session",
  "parcoursup_publication_auto",
  "parcoursup_visible",
  "affelnet_perimetre",
  "affelnet_statut",
  "affelnet_previous_statut",
  "affelnet_session",
  "affelnet_previous_session",
  "affelnet_publication_auto",
  "affelnet_visible",
  "diplome",
  "tags",
  "annee",
  "qualite",
  "habilite",
  "duree",
  "region",
  "date_debut_start",
  "date_debut_end",
  "parcoursup_published_date_start",
  "parcoursup_published_date_end",
  "affelnet_published_date_start",
  "affelnet_published_date_end",
  "last_statut_update_date_start",
  "last_statut_update_date_end",
  "nouvelle_fiche",
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
  {
    Header: "Fiche catalogue",
    accessor: "_id",
    width: 200,
    exportable: true,
    formatter: (value) => `${process.env.REACT_APP_BASE_URL}/formation/${value}`,
  },
  {
    Header: "Numero academie",
    accessor: "num_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Nom academie",
    accessor: "nom_academie",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Numero departement",
    accessor: "num_departement",
    width: 200,
    exportable: true,
  },
  {
    Header: "Siret Responsable",
    accessor: "etablissement_gestionnaire_siret",
    width: 200,
    exportable: true,
    editorInput: "text",
  },
  {
    Header: "UAI Responsable",
    accessor: "etablissement_gestionnaire_uai",
    width: 200,
    exportable: true,
  },
  {
    Header: "Raison sociale de l'organisme responsable",
    accessor: "etablissement_gestionnaire_entreprise_raison_sociale",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Enseigne Responsable",
    accessor: "etablissement_gestionnaire_enseigne",
    width: 200,
    exportable: true,
  },
  {
    Header: "Siret Formateur",
    accessor: "etablissement_formateur_siret",
    width: 200,
    exportable: true,
  },
  {
    Header: "UAI formateur",
    accessor: "etablissement_formateur_uai",
    width: 200,
    exportable: true,
  },
  {
    Header: "Enseigne Formateur",
    accessor: "etablissement_formateur_enseigne",
    width: 200,
    exportable: true,
  },
  {
    Header: "Raison sociale du siret formateur",
    accessor: "etablissement_formateur_entreprise_raison_sociale",
    width: 200,
    exportable: true,
  },
  {
    Header: "Gestionnaire certifié qualité ? ",
    accessor: "etablissement_gestionnaire_certifie_qualite",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Formateur certifié qualité ? ",
    accessor: "etablissement_formateur_certifie_qualite",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Diplome",
    accessor: "diplome",
    width: 200,
    exportable: true,
  },
  {
    Header: "Intitule long de la formation",
    accessor: "intitule_long",
    width: 200,
    exportable: true,
  },
  {
    Header: "Intitule court de la formation",
    accessor: "intitule_court",
    width: 200,
    exportable: true,
  },
  {
    Header: "Intitule Carif-Oref",
    accessor: "intitule_rco",
    width: 200,
    exportable: true,
  },
  {
    Header: "Organisme Habilite (RNCP)",
    accessor: "etablissement_reference_habilite_rncp",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Eligible apprentissage (RNCP)",
    accessor: "rncp_eligible_apprentissage",
    width: 200,
    exportable: true,
  },
  {
    Header: "Codes RNCP",
    accessor: "rncp_code",
    width: 200,
    exportable: true,
  },
  {
    Header: "Etat fiche RNCP",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => value?.active_inactive,
  },
  {
    Header: "code_type_certif",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => value?.code_type_certif,
  },
  {
    Header: "type_certif",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) => value?.type_certif,
  },
  {
    Header: "Intitule du code RNCP",
    accessor: "rncp_intitule",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Certificateurs",
    accessor: "rncp_details.certificateurs",
    width: 200,
    exportable: true,
    formatter: (value) => {
      return value
        ?.map(({ certificateur, siret_certificateur }) => `${certificateur} (siret: ${siret_certificateur ?? "n/a"})`)
        .join(", ");
    },
  },
  {
    Header: "Codes ROME",
    accessor: "rome_codes",
    width: 200,
    exportable: true,
  },
  {
    Header: "Code du diplome ou du titre suivant la nomenclature de l'Education nationale (CodeEN)",
    accessor: "cfd",
    width: 400,
    exportable: true,
  },
  {
    Header: "Code du diplome de l'année d'entrée",
    accessor: "cfd_entree",
    width: 400,
    exportable: true,
  },
  {
    Header: "Liste MEF rattaches",
    accessor: "bcn_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsFormatter,
  },
  {
    Header: "Dates d'expiration MEF rattaches",
    accessor: "bcn_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsExpirationFormatter,
  },
  {
    Header: "Liste MEF Affelnet",
    accessor: "affelnet_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsFormatter,
  },
  {
    Header: "Dates d'expiration MEF Affelnet",
    accessor: "affelnet_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsExpirationFormatter,
  },
  {
    Header: "Liste MEF Parcoursup",
    accessor: "parcoursup_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsFormatter,
  },
  {
    Header: "Dates d'expiration MEF Parcoursup",
    accessor: "parcoursup_mefs_10",
    width: 200,
    exportable: true,
    formatter: mefsExpirationFormatter,
  },
  {
    Header: "Périmètre Affelnet",
    accessor: "affelnet_perimetre",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Statut Affelnet",
    accessor: "affelnet_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Statut sur la précédente campagne Affelnet",
    accessor: "affelnet_previous_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Session sur la campagne Affelnet",
    accessor: "affelnet_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Session sur la précédente campagne Affelnet",
    accessor: "affelnet_previous_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Information Affelnet",
    accessor: "affelnet_infos_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Information Affelnet (url)",
    accessor: "affelnet_url_infos_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Modalités particulières",
    accessor: "affelnet_modalites_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Modalités particulières (url)",
    accessor: "affelnet_url_modalites_offre",
    width: 400,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Motif de non publication Affelnet",
    accessor: "affelnet_raison_depublication",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Périmètre Parcoursup",
    accessor: "parcoursup_perimetre",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Statut Parcoursup",
    accessor: "parcoursup_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Statut sur la précédente campagne Parcoursup",
    accessor: "parcoursup_previous_statut",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Session sur la campagne Parcoursup",
    accessor: "parcoursup_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Session sur la précédente campagne Parcoursup",
    accessor: "parcoursup_previous_session",
    width: 200,
    exportable: true,
    formatter: booleanFormatter,
  },
  {
    Header: "Date du dernier envoi vers Parcoursup",
    accessor: "parcoursup_export_date",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : ""),
  },
  {
    Header: "Motif de non publication Parcoursup",
    accessor: "parcoursup_raison_depublication",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Motif de rejet Parcoursup",
    accessor: "parcoursup_error",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Motif de la réinitialisation de statut Parcoursup",
    accessor: "parcoursup_statut_reinitialisation",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value?.comment),
  },
  {
    Header: "Date de la réinitialisation de statut Parcoursup",
    accessor: "parcoursup_statut_reinitialisation",
    width: 200,
    exportable: true,
    formatter: (value) => (value?.date ? new Date(value?.date).toLocaleDateString("fr-FR") : ""),
  },

  {
    Header: "Niveau de la formation",
    accessor: "niveau",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Dates de formation",
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
    Header: "Capacite",
    accessor: "capacite",
    width: 200,
    exportable: true,
  },
  {
    Header: "Duree",
    accessor: "duree",
    width: 200,
    exportable: true,
  },
  {
    Header: "Annee",
    accessor: "annee",
    width: 200,
    exportable: true,
  },
  {
    Header: "UAI formation",
    accessor: "uai_formation",
    width: 200,
    exportable: true,
  },
  {
    Header: "Edition de l'UAI formation",
    accessor: "editedFields.uai_formation",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? "Oui" : "Non"),
  },
  {
    Header: "Date d’édition de l’UAI lieu",
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
    Header: "Modification de l’UAI lieu par",
    accessor: "updates_history",
    width: 200,
    exportable: true,
    formatter: (value) => {
      const uai_updated_history = value?.filter((value) => !!value.to?.uai_formation)?.sort(sortDescending);

      return uai_updated_history?.length ? uai_updated_history[0]?.to.last_update_who : "";
    },
  },
  {
    Header: "Adresse formation",
    accessor: "lieu_formation_adresse",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Code Postal",
    accessor: "code_postal",
    width: 200,
    exportable: true,
  },
  {
    Header: "Ville",
    accessor: "localite",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Code Commune Insee",
    accessor: "code_commune_insee",
    width: 200,
    exportable: true,
  },
  {
    Header: "Geolocalisation",
    accessor: "lieu_formation_geo_coordonnees",
    width: 200,
    exportable: true,
  },
  {
    Header: "Distance entre le lieu de formation et l'établissement formateur",
    accessor: "distance_lieu_formation_etablissement_formateur",
    width: 200,
    exportable: true,
  },
  {
    Header: "Numero Academie Siege",
    accessor: "etablissement_gestionnaire_num_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Nom Academie Siege",
    accessor: "etablissement_gestionnaire_nom_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Url ONISEP",
    accessor: "onisep_url",
    width: 300,
    exportable: true,
  },
  {
    Header: "Eligible au catalogue général ?",
    accessor: "catalogue_published",
    width: 200,
    exportable: true,
  },
  {
    Header: "Clé ministere educatif",
    accessor: "cle_ministere_educatif",
    width: 200,
    exportable: true,
  },
  {
    Header: "parcoursup_id (g_ta_cod)",
    accessor: "parcoursup_id",
    width: 200,
    exportable: true,
  },
  {
    Header: "affelnet_id (code vœu)",
    accessor: "affelnet_id",
    width: 200,
    exportable: true,
  },
  {
    Header: "Partenaires",
    accessor: "rncp_details.partenaires",
    width: 200,
    exportable: true,
    formatter: (value, formation) => {
      const filteredPartenaires = (value ?? []).filter(({ Siret_Partenaire }) =>
        [formation.etablissement_gestionnaire_siret, formation.etablissement_formateur_siret].includes(Siret_Partenaire)
      );
      return filteredPartenaires
        ?.map(
          ({ Nom_Partenaire, Siret_Partenaire, Habilitation_Partenaire }) =>
            `${Nom_Partenaire} (siret: ${Siret_Partenaire ?? "n/a"}) : ${Habilitation_Partenaire}`
        )
        .join(", ");
    },
  },
  {
    Header: "Adresse OFA formateur",
    accessor: "etablissement_formateur_adresse",
    width: 200,
    exportable: true,
  },
  {
    Header: "Code Postal OFA formateur",
    accessor: "etablissement_formateur_code_postal",
    width: 200,
    exportable: true,
  },
  {
    Header: "Ville OFA formateur",
    accessor: "etablissement_formateur_localite",
    width: 200,
    exportable: true,
  },
  {
    Header: "Code Commune Insee OFA formateur",
    accessor: "etablissement_formateur_code_commune_insee",
    width: 200,
    exportable: true,
  },
  {
    Header: "Nda gestionnaire",
    accessor: "etablissement_gestionnaire_nda",
    width: 200,
    exportable: true,
  },
  {
    Header: "Nda formateur",
    accessor: "etablissement_formateur_nda",
    width: 200,
    exportable: true,
  },
  {
    Header: "Id RCO Info",
    accessor: "id_rco_formation",
    width: 200,
    exportable: true,
    formatter: (value) => (typeof value === "string" ? value?.split("|")?.pop() : value),
  },
  {
    Header: "id RCO formation",
    accessor: "id_formation",
    width: 200,
    exportable: true,
  },
  {
    Header: "id RCO action",
    accessor: "ids_action",
    width: 200,
    exportable: true,
  },
  {
    Header: "id RCO certifinfo",
    accessor: "id_certifinfo",
    width: 200,
    exportable: true,
  },
  {
    Header: "Date de fermeture du CFD",
    accessor: "cfd_date_fermeture",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : ""),
  },
  {
    Header: "Date de fermeture du CFD de l'année d'entrée",
    accessor: "cfd_entree_date_fermeture",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? new Date(value).toLocaleDateString("fr-FR") : ""),
  },
  {
    Header: "Date de fin de validite au RNCP",
    accessor: "rncp_details",
    width: 200,
    exportable: true,
    formatter: (value) =>
      value?.date_fin_validite_enregistrement
        ? new Date(value.date_fin_validite_enregistrement).toLocaleDateString("fr-FR")
        : "",
  },
  {
    Header: "Tags",
    accessor: "tags",
    width: 200,
    exportable: true,
    formatter: (tags) => tags?.sort((a, b) => a - b),
  },

  {
    Header: "Etablissement gestionnaire actif",
    accessor: "etablissement_gestionnaire_actif",
    width: 200,
    exportable: true,
  },
  {
    Header: "Etablissement formateur_actif",
    accessor: "etablissement_formateur_actif",
    width: 200,
    exportable: true,
  },
  {
    Header: "Region",
    accessor: "region",
    width: 200,
    exportable: true,
  },
  {
    Header: "Siret Actif",
    accessor: "siret_actif",
    width: 200,
    exportable: true,
  },

  {
    Header: "Nouvelle fiche",
    accessor: "nouvelle_fiche",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? "Oui" : "Non"),
  },
];

/**
 * Champs de la recherche avancée
 */
export const queryBuilderField = [
  { text: "Raison sociale", value: "etablissement_gestionnaire_entreprise_raison_sociale.keyword" },
  { text: "Siret formateur", value: "etablissement_formateur_siret.keyword" },
  { text: "Siret gestionnaire", value: "etablissement_gestionnaire_siret.keyword" },
  { text: "UAI du lieu de formation", value: "uai_formation.keyword" },
  { text: "Diplôme", value: "diplome.keyword" },
  { text: "Intitulé", value: "intitule_court.keyword" },
  { text: "Code RNCP", value: "rncp_code.keyword" },
  { text: "Code diplôme", value: "cfd.keyword" },
  { text: "Code diplôme (année d'entrée)", value: "cfd_entree.keyword" },
  { text: "Commune du lieu de formation", value: "localite.keyword" },
  { text: "Identifiant Formation CO", value: "id_formation.keyword" },
  { text: "Identifiants Action CO", value: "ids_action.keyword" },
  { text: "Identifiant Certif Info", value: "id_certifinfo.keyword" },
  { text: "Nda gestionnaire", value: "etablissement_gestionnaire_nda.keyword" },
  { text: "Nda formateur", value: "etablissement_formateur_nda.keyword" },
  { text: "Libelle court", value: "libelle_court.keyword" },
  { text: "Niveau formation diplome", value: "niveau_formation_diplome.keyword" },
  { text: "MEF 10", value: "bcn_mefs_10.mef10.keyword" },
  { text: "Groupe Spécialité", value: "rncp_details.nsf_code.keyword" },
  { text: "Certificateur", value: "rncp_details.certificateurs.certificateur.keyword" },
  { text: "Statut du SIRET", value: "siret_actif.keyword" },
  { text: "Région", value: "region.keyword" },
  { text: "Identifiant Affelnet (code voeu)", value: "affelnet_id.keyword" },
  { text: "Identifiant Parcoursup (GTA)", value: "parcoursup_id.keyword" },
];

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

  { type: "divider" },

  {
    componentId: `parcoursup_perimetre`,
    type: "facet",
    dataField: "parcoursup_perimetre",
    title: "Dans le périmètre Parcoursup",
    filterLabel: "Dans le périmètre Parcoursup",
    selectAllLabel: "Tous",
    sortBy: "desc",
    displayInContext: [CONTEXT.CATALOGUE_GENERAL],
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
    acl: "page_catalogue/voir_status_publication_ps",
    helpTextSection: helpText.search.parcoursup_statut,
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
        componentId: `parcoursup_previous_statut`,
        type: "facet",
        dataField: "parcoursup_previous_statut.keyword",
        title: "Statut sur la précédente campagne ",
        filterLabel: "Statut sur la précédente campagne Parcoursup ",
        selectAllLabel: "Tous",
        sortBy: "count",
        acl: "page_catalogue/voir_status_publication_ps",
        helpTextSection: helpText.search.parcoursup_previous_statut,
      },

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
        componentId: `parcoursup_publication_auto`,
        type: "facet",
        dataField: "parcoursup_publication_auto",
        title: "Publication automatique",
        filterLabel: "Publication automatique Parcoursup",
        sortBy: "desc",
        transformData: (data) => {
          console.log(data);
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
                    (value) => ({ Oui: true, Non: false, "Pas d'information": null }[value])
                  ),
                },
              },
            };
          }
          return {};
        },
      },
    ],
  },

  { type: "divider" },

  {
    componentId: `affelnet_perimetre`,
    type: "facet",
    dataField: "affelnet_perimetre",
    title: "Dans le périmètre Affelnet",
    filterLabel: "Dans le périmètre Affelnet",
    selectAllLabel: "Tous",
    sortBy: "desc",
    displayInContext: [CONTEXT.CATALOGUE_GENERAL],
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
    acl: "page_catalogue/voir_status_publication_aff",
    helpTextSection: helpText.search.affelnet_statut,
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
        componentId: `affelnet_previous_statut`,
        type: "facet",
        dataField: "affelnet_previous_statut.keyword",
        title: "Statut sur la précédente campagne",
        filterLabel: "Statut sur la précédente campagne Affelnet",
        selectAllLabel: "Tous",
        sortBy: "count",
        acl: "page_catalogue/voir_status_publication_aff",
        helpTextSection: helpText.search.affelnet_previous_statut,
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

      {
        componentId: `affelnet_publication_auto`,
        type: "facet",
        dataField: "affelnet_publication_auto",
        title: "Publication automatique",
        filterLabel: "Publication automatique Affelnet",
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
                    (value) => ({ Oui: true, Non: false, "Pas d'information": null }[value])
                  ),
                },
              },
            };
          }
          return {};
        },
      },

      {
        componentId: `affelnet_visible`,
        type: "facet",
        dataField: "affelnet_visible",
        title: "Visible SLA",
        filterLabel: "Visible SLA Affelnet",
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
                  affelnet_visible: values.map(
                    (value) => ({ Oui: true, Non: false, "Pas d'information": null }[value])
                  ),
                },
              },
            };
          }
          return {};
        },
      },
    ],
  },

  { type: "divider" },

  {
    type: "advanced",
    openText: "Masquer les filtres avancés (niveau, durée, dates...)",
    closeText: "Filtres avancés (niveau, durée, dates...)",
    filters: [
      {
        componentId: `date_debut`,
        type: "date-range",
        dataField: "date_debut",
        title: "Date de début de formation",
        filterLabel: "Début de formation",
        helpTextSection: helpText.search.periode.title,
      },

      {
        componentId: `num_departement`,
        type: "facet",
        dataField: "num_departement.keyword",
        title: "Département",
        filterLabel: "Département",
        selectAllLabel: "Tous",
        sortBy: "asc",
        transformData: (data) => data.map((d) => ({ ...d, key: `${d.key} - ${departements[d.key]}` })),
        customQuery: (values) => ({
          query: values?.length && {
            terms: {
              "num_departement.keyword": values?.map((value) =>
                typeof value === "string" ? value?.split(" - ")[0] : value
              ),
            },
          },
        }),
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
        transformData: (data) => data.map((d) => ({ ...d, key: annees[d.key] })),
        customQuery: (values) => ({
          query: values?.length && {
            terms: {
              "annee.keyword": values?.map((value) => Object.keys(annees).find((annee) => annees[annee] === value)),
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
        componentId: `last_statut_update_date`,
        type: "date-range",
        dataField: "last_statut_update_date",
        title: "Dernière mise à jour du statut",
        filterLabel: "Statut modifié",
      },
    ],
  },
];

export const dataSearch = {
  dataField: [
    "etablissement_gestionnaire_entreprise_raison_sociale",
    "intitule_long",
    "cfd",
    "rncp_code",
    "uai_formation",
    "etablissement_gestionnaire_uai",
    "etablissement_formateur_uai",
    "etablissement_formateur_siret",
    "etablissement_gestionnaire_siret",
    "cle_ministere_educatif",
  ],
  placeholder:
    "Saisissez une raison sociale, un Siret, un intitulé de formation, un code RNCP ou CFD (code formation diplôme)",
  fieldWeights: [4, 3, 2, 2, 2, 2, 2, 1, 1, 1],
};

export default {
  allowedFilters,
  columnsDefinition,
  quickFiltersDefinition,
  queryBuilderField,
  dataSearch,
};
