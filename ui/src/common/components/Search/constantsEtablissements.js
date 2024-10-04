import { escapeDiacritics } from "../../utils/downloadUtils";
import helpText from "../../../locales/helpText.json";

export const allowedFilters = [
  `QUERYBUILDER`,
  `SEARCH`,
  `num_departement`,
  `nom_academie`,
  `tags`,
  "published",
  "qualite",
];

/**
 * Colonnes inclues dans l'export CSV
 */
export const columnsDefinition = [
  {
    Header: "Fiche catalogue",
    accessor: "_id",
    width: 200,
    exportable: true,
    formatter: (value) => `${process.env.REACT_APP_BASE_URL}/etablissement/${value}`,
  },
  {
    Header: "Siren",
    accessor: "siren",
    width: 200,
    exportable: true,
  },
  {
    Header: "Nda",
    accessor: "nda",
    width: 200,
    exportable: true,
  },
  {
    Header: "Siret",
    accessor: "siret",
    width: 200,
    exportable: true,
  },
  {
    Header: "Nom / Enseigne",
    accessor: "enseigne",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Raison sociale de l'entreprise",
    accessor: "entreprise_raison_sociale",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Code NAF",
    accessor: "naf_code",
    width: 200,
    exportable: false,
  },
  {
    Header: "Libelle du code NAT",
    accessor: "naf_libelle",
    width: 200,
    exportable: false,
  },
  {
    Header: "Uai",
    accessor: "uai",
    width: 200,
    exportable: true,
  },
  {
    Header: "Certifié Qualité ?",
    accessor: "certifie_qualite",
    width: 200,
    exportable: true,
  },
  {
    Header: "Est le siege de l'entreprise",
    accessor: "siege_social",
    width: 200,
    exportable: true,
  },
  {
    Header: "Siret Siege social",
    accessor: "etablissement_siege_siret",
    width: 200,
    exportable: true,
  },
  {
    Header: "Adresse",
    accessor: "adresse",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Numero de voie",
    accessor: "numero_voie",
    width: 60,
    exportable: true,
  },
  {
    Header: "Type de voie",
    accessor: "type_voie",
    width: 60,
    exportable: true,
  },
  {
    Header: "Nom de la voie",
    accessor: "nom_voie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Complement d'adresse",
    accessor: "complement_adresse",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Code postal",
    accessor: "code_postal",
    width: 120,
    exportable: true,
  },
  {
    Header: "Numero de departement",
    accessor: "num_departement",
    width: 120,
    exportable: true,
  },
  {
    Header: "Localite",
    accessor: "localite",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Code commune INSEE",
    accessor: "code_insee_localite",
    width: 200,
    exportable: true,
  },
  {
    Header: "Cedex",
    accessor: "cedex",
    width: 200,
    exportable: true,
  },
  {
    Header: "Region",
    accessor: "region_implantation_nom",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Numero academie",
    accessor: "num_academie",
    width: 200,
    exportable: true,
  },
  {
    Header: "Nom de l'academie",
    accessor: "nom_academie",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },
  {
    Header: "Email",
    accessor: "ds_questions_email",
    width: 200,
    exportable: false,
  },
  {
    Header: "Tags",
    accessor: "tags",
    width: 200,
    exportable: true,
    formatter: (tags) => tags?.sort((a, b) => a - b) ?? "",
  },
];

/**
 * Champs de la recherche avancée
 */
export const queryBuilderField = [
  { text: "Raison sociale", value: "raison_sociale_enseigne.keyword" },
  { text: "Siret", value: "siret.keyword" },
  { text: "Certifié Qualité", value: "certifie_qualite.keyword" },
  { text: "Uai", value: "uai.keyword" },
  { text: "Nda", value: "nda.keyword" },
];

export const quickFiltersDefinition = [
  {
    componentId: `nom_academie`,
    type: "facet",
    dataField: "nom_academie.keyword",
    title: "Académie",
    filterLabel: "Académie",
    selectAllLabel: "Toutes les académies",
    sortBy: "asc",
  },
  {
    componentId: `num_departement`,
    type: "facet",
    dataField: "num_departement.keyword",
    title: "Département",
    filterLabel: "Département",
    selectAllLabel: "Tous",
    sortBy: "asc",
  },
  {
    componentId: `tags`,
    type: "facet",
    dataField: "tags.keyword",
    title: "Année(s)",
    filterLabel: "Année(s)",
    selectAllLabel: "Toutes",
    sortBy: "asc",
    helpTextSection: helpText.search.tags,
  },
  {
    componentId: `qualite`,
    type: "facet",
    dataField: "certifie_qualite",
    title: "Certifiés Qualité",
    filterLabel: "Certifiés Qualité",
    sortBy: "asc",
    helpTextSection: helpText.search.qualite,
    showSearch: false,
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1) {
        return {
          query: {
            match: {
              certifie_qualite: values[0] === "Oui",
            },
          },
        };
      }
      return {};
    },
  },
];

export const dataSearch = {
  dataField: ["raison_sociale_enseigne", "uai", "siret"],
  placeholder: "Saisissez une raison sociale, un UAI, ou un numéro de Siret",
  fieldWeights: [3, 2, 1],
};

export default {
  allowedFilters,
  columnsDefinition,
  quickFiltersDefinition,
  queryBuilderField,
  dataSearch,
};
