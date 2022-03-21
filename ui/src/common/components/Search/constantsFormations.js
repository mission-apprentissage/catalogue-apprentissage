import { escapeDiacritics } from "../../utils/downloadUtils";
import helpText from "../../../locales/helpText.json";

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
  "rncp_etablissement_gestionnaire_habilite",
  "rome_codes",
  `rncp_code`,
  `parcoursup_statut`,
  `affelnet_statut`,
  "diplome",
  "tags",
  "annee",
  "qualiopi",
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
    Header: "Gestionnaire certifié qualiopi ? ",
    accessor: "etablissement_gestionnaire_catalogue_published",
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
    Header: "Organisme Habilite (RNCP)",
    accessor: "rncp_etablissement_gestionnaire_habilite",
    width: 200,
    exportable: true,
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
    Header: "Liste MEF rattaches",
    accessor: "bcn_mefs_10",
    width: 200,
    exportable: true,
    formatter: (value) => value?.map((x) => x?.mef10)?.join(","),
  },
  {
    Header: "Liste MEF Affelnet",
    accessor: "affelnet_mefs_10",
    width: 200,
    exportable: true,
    formatter: (value) => value?.map((x) => x?.mef10)?.join(","),
  },
  {
    Header: "Liste MEF Parcoursup",
    accessor: "parcoursup_mefs_10",
    width: 200,
    exportable: true,
    formatter: (value) => value?.map((x) => x?.mef10)?.join(","),
  },
  {
    Header: "Statut Affelnet",
    accessor: "affelnet_statut",
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
    Header: "Niveau de la formation",
    accessor: "niveau",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Debut de formation",
    accessor: "periode",
    width: 200,
    exportable: true,
    formatter: (periode) => {
      return periode
        ?.map((dateStr) => {
          const formattedDate = new Date(dateStr).toLocaleString("fr-FR", { month: "long", year: "numeric" });
          return formattedDate === "Invalid Date" ? dateStr : formattedDate;
        })
        ?.join(", ");
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
    Header: "Etablissement dans le catalogue eligible ? ",
    accessor: "etablissement_reference_catalogue_published",
    width: 200,
    exportable: true,
  },
  {
    Header: "clé ministere educatif ",
    accessor: "cle_ministere_educatif",
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
    formatter: (value) => value?.split("|")?.pop(),
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
    formatter: (value) => new Date(value).toLocaleDateString("fr-FR"),
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
    showCatalogEligibleOnly: true,
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
    showCatalogEligibleOnly: true,
    helpTextSection: helpText.search.affelnet_statut,
  },
  {
    componentId: `num_departement`,
    dataField: "num_departement.keyword",
    title: "Département",
    filterLabel: "Département",
    selectAllLabel: "Tous",
    sortBy: "asc",
  },
  {
    componentId: `niveau`,
    dataField: "niveau.keyword",
    title: "Niveau de formation",
    filterLabel: "Niveau de formation",
    selectAllLabel: "Tous les niveaux",
    sortBy: "asc",
  },
  {
    componentId: `tags`,
    dataField: "tags.keyword",
    title: "Année(s)",
    filterLabel: "Année(s)",
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
  },
  {
    componentId: `duree`,
    dataField: "duree.keyword",
    title: "Durée",
    filterLabel: "Durée",
    selectAllLabel: "Toutes",
    sortBy: "asc",
    isAuth: true, // hide for anonymous
  },
  {
    componentId: `qualiopi`,
    dataField: "etablissement_gestionnaire_catalogue_published",
    title: "Certifiés Qualiopi",
    filterLabel: "Certifiés Qualiopi",
    sortBy: "asc",
    helpTextSection: helpText.search.qualiopi,
    showSearch: false,
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1) {
        return {
          query: {
            match: {
              etablissement_gestionnaire_catalogue_published: values[0] === "Oui",
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
  ],
  placeholder:
    "Saisissez une raison sociale, un Siret, un intitulé de formation, un code RNCP ou CFD (code formation diplôme)",
  fieldWeights: [4, 3, 2, 2, 2, 2, 2, 1, 1, 1],
};

export default {
  FILTERS,
  columnsDefinition,
  facetDefinition,
  queryBuilderField,
  dataSearch,
};
