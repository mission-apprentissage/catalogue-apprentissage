import { escapeDiacritics } from "../../utils/downloadUtils";
import helpText from "../../../locales/helpText.json";
import { CONTEXT } from "../../../constants/context";
import { departements } from "../../../constants/departements";
import { annees } from "../../../constants/annees";
import { sortDescending } from "../../utils/historyUtils";

const FILTERS = () => [
  `QUERYBUILDER`,
  `SEARCH`,
  "etablissement_formateur_siret",
  "etablissement_gestionnaire_siret",
  "num_academie",
  `niveau`,
  "etablissement_gestionnaire_siren",
  `cfd`,
  `num_departement`,
  `nom_academie`,
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
  `rncp_code`,
  `bcn_mefs_10`,
  `parcoursup_statut`,
  `affelnet_statut`,
  "diplome",
  "tags",
  "annee",
  "qualite",
  "habilite",
  "duree",
  "periode_start",
  "periode_end",
  "parcoursup_published_date_start",
  "parcoursup_published_date_end",
  "affelnet_published_date_start",
  "affelnet_published_date_end",
  "last_statut_update_date_start",
  "last_statut_update_date_end",
];

const columnsDefinition = [
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
    formatter: (value) => escapeDiacritics(value),
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
    Header: "Uai Responsable",
    accessor: "etablissement_gestionnaire_uai",
    width: 200,
    exportable: true,
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
    Header: "Uai formateur",
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
    accessor: "etablissement_gestionnaire_entreprise_raison_sociale",
    width: 200,
    exportable: true,
  },
  {
    Header: "Gestionnaire certifié qualité ? ",
    accessor: "etablissement_gestionnaire_certifie_qualite",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? "OUI" : "NON"),
  },
  {
    Header: "Formateur certifié qualité ? ",
    accessor: "etablissement_formateur_certifie_qualite",
    width: 200,
    exportable: true,
    formatter: (value) => (value ? "OUI" : "NON"),
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
    formatter: (value) => (value ? "OUI" : "NON"),
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
    formatter: (value) => escapeDiacritics(value),
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
    formatter: (value) => value?.map((x) => x?.mef10)?.join(",") ?? "",
  },
  {
    Header: "Liste MEF Affelnet",
    accessor: "affelnet_mefs_10",
    width: 200,
    exportable: true,
    formatter: (value) => value?.map((x) => x?.mef10)?.join(",") ?? "",
  },
  {
    Header: "Liste MEF Parcoursup",
    accessor: "parcoursup_mefs_10",
    width: 200,
    exportable: true,
    formatter: (value) => value?.map((x) => x?.mef10)?.join(",") ?? "",
  },
  {
    Header: "Statut Affelnet",
    accessor: "affelnet_statut",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Information Affelnet",
    accessor: "affelnet_infos_offre",
    width: 400,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Information Affelnet (url)",
    accessor: "affelnet_url_infos_offre",
    width: 400,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Modalités particulières",
    accessor: "affelnet_modalites_offre",
    width: 400,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Modalités particulières (url)",
    accessor: "affelnet_url_modalites_offre",
    width: 400,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Motif de non publication Affelnet",
    accessor: "affelnet_raison_depublication",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Statut Parcoursup",
    accessor: "parcoursup_statut",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
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
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Motif de rejet Parcoursup",
    accessor: "parcoursup_error",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },

  {
    Header: "Niveau de la formation",
    accessor: "niveau",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  // {
  //   Header: "Debut de formation",
  //   accessor: "periode",
  //   width: 200,
  //   exportable: true,
  //   formatter: (periode) => {
  //     return periode
  //       ?.map((dateStr) => {
  //         const formattedDate = new Date(dateStr).toLocaleString("fr-FR", { month: "long", year: "numeric" });
  //         return formattedDate === "Invalid Date" ? dateStr : formattedDate;
  //       })
  //       ?.join(", ");
  //   },
  // },
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
    Header: "Uai formation",
    accessor: "uai_formation",
    width: 200,
    exportable: true,
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
    formatter: (value) => escapeDiacritics(value),
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
    formatter: (value) => escapeDiacritics(value),
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
];

const queryBuilderField = [
  { text: "Raison sociale", value: "etablissement_gestionnaire_entreprise_raison_sociale.keyword" },
  { text: "Siret formateur", value: "etablissement_formateur_siret.keyword" },
  { text: "Siret gestionnaire", value: "etablissement_gestionnaire_siret.keyword" },
  { text: "Uai du lieu de formation", value: "uai_formation.keyword" },
  { text: "Diplôme", value: "diplome.keyword" },
  { text: "Intitulé", value: "intitule_court.keyword" },
  { text: "Code RNCP", value: "rncp_code.keyword" },
  { text: "Code diplôme", value: "cfd.keyword" },
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
];

const facetDefinition = () => [
  {
    componentId: `nom_academie`,
    dataField: "nom_academie.keyword",
    title: "Académie",
    filterLabel: "Académie",
    selectAllLabel: "Toutes les académies",
    sortBy: "asc",
  },
  {
    componentId: `parcoursup_statut`,
    dataField: "parcoursup_statut.keyword",
    title: "Statut Parcoursup",
    filterLabel: "Statut Parcoursup",
    selectAllLabel: "Tous",
    sortBy: "count",
    acl: "page_catalogue/voir_status_publication_ps",
    // displayInContext: [CONTEXT.CATALOGUE_GENERAL],
    helpTextSection: helpText.search.parcoursup_statut,
  },
  {
    componentId: `affelnet_statut`,
    dataField: "affelnet_statut.keyword",
    title: "Statut Affelnet",
    filterLabel: "Statut Affelnet",
    selectAllLabel: "Tous",
    sortBy: "count",
    acl: "page_catalogue/voir_status_publication_aff",
    // displayInContext: [CONTEXT.CATALOGUE_GENERAL],
    helpTextSection: helpText.search.affelnet_statut,
  },
  {
    componentId: `num_departement`,
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
    dataField: "niveau.keyword",
    title: "Niveau visé",
    filterLabel: "Niveau visé",
    selectAllLabel: "Tous les niveaux",
    sortBy: "asc",
  },
  {
    componentId: `tags`,
    dataField: "tags.keyword",
    title: "Début de formation (année)",
    filterLabel: "Début de formation (année)",
    selectAllLabel: "Toutes",
    sortBy: "asc",
  },
  {
    componentId: `annee`,
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
    dataField: "etablissement_gestionnaire_certifie_qualite",
    title: "Certifié Qualité",
    filterLabel: "Certifié Qualité",
    sortBy: "desc",
    helpTextSection: helpText.search.qualite,
    showSearch: false,
    displayInContext: [CONTEXT.CATALOGUE_NON_ELIGIBLE],
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1) {
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
    dataField: "etablissement_reference_habilite_rncp",
    title: "Habilité RNCP",
    filterLabel: "Habilité RNCP",
    sortBy: "desc",
    showSearch: false,
    displayInContext: [CONTEXT.CATALOGUE_NON_ELIGIBLE],
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1) {
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
];

const dataSearch = {
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
    "parcoursup_id",
    "affelnet_id",
  ],
  placeholder:
    "Saisissez une raison sociale, un Siret, un intitulé de formation, un code RNCP ou CFD (code formation diplôme), un identifiant Parcoursup ou Affelnet",
  fieldWeights: [4, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1],
};

export default {
  FILTERS,
  columnsDefinition,
  facetDefinition,
  queryBuilderField,
  dataSearch,
};
