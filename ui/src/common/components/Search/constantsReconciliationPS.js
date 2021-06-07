import { escapeDiacritics } from "../../utils/downloadUtils";

const FILTERS = (context) => {
  if (context === "reconciliation_ps_inconnus") {
    return [
      `QUERYBUILDER-${context}`,
      `SEARCH-${context}`,
      `nom_academie-${context}`,
      "statut_reconciliation",
      `rncp-${context}`,
      `cfd-${context}`,
      `reject-${context}`,
      `statuts-${context}`,
    ];
  }
  return [
    `QUERYBUILDER-${context}`,
    `SEARCH-${context}`,
    `nom_academie-${context}`,
    "statut_reconciliation",
    `rncp-${context}`,
    `cfd-${context}`,
    `statuts-${context}`,
  ];
};

const columnsDefinition = [
  {
    Header: "Identifiant ParcourSup",
    accessor: "id_parcoursup",
    width: 200,
    editable: false,
  },
  {
    Header: "Nom de l'academie",
    accessor: "nom_academie",
    width: 200,
    editable: false,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Code du diplome ou du titre suivant la nomenclature de l'Education nationale (CodeEN)",
    accessor: "codes_cfd_mna",
    width: 400,
    editable: false,
  },
  {
    Header: "Libelle de la formation",
    accessor: "libelle_formation",
    width: 400,
    editable: false,
  },
  {
    Header: "Libelle de la formation",
    accessor: "libelle_specialite",
    width: 400,
    editable: false,
  },
  {
    Header: "Code postal",
    accessor: "code_postal",
    width: 120,
    editable: false,
  },
  {
    Header: "Localite",
    accessor: "libelle_commune",
    width: 200,
    editable: false,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Informations similaires",
    accessor: "matching_type",
    width: 120,
    editable: false,
  },
  {
    Header: "match",
    accessor: "matching_mna_formation",
    width: 200,
    editable: false,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "matching_mna_parcoursup_statuts",
    accessor: "matching_mna_parcoursup_statuts",
    width: 200,
    editable: false,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "statut_reconciliation",
    accessor: "statut_reconciliation",
    width: 200,
    editable: false,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Uai Gestionnaire",
    accessor: "uai_gestionnaire",
    width: 120,
    editable: false,
  },
  {
    Header: "Uai Composante",
    accessor: "uai_composante",
    width: 120,
    editable: false,
  },
  {
    Header: "Uai Affilié",
    accessor: "uai_affilie",
    width: 120,
    editable: false,
  },
  {
    Header: "Siret sur Cerfa",
    accessor: "siret_cerfa",
    width: 120,
    editable: false,
  },
  {
    Header: "Nom établissement uai composante",
    accessor: "libelle_uai_composante",
    width: 120,
    editable: false,
  },
  {
    Header: "Adresse",
    accessor: "complement_adresse_1",
    width: 120,
    editable: false,
  },
  // {
  //   Header: "Region",
  //   accessor: "region_implantation_nom",
  //   width: 200,
  //   editable: false,
  //   formatter: (value) => escapeDiacritics(value),
  // },
  // {
  //   Header: "Tags",
  //   accessor: "tags",
  //   width: 200,
  //   editable: false,
  //   formatter: (tags) => tags?.sort((a, b) => a - b),
  // },
];

const queryBuilderField = [{ text: "Identifiant parcoursup", value: "id_parcoursup.keyword" }];

const facetDefinition = (context) => [
  {
    componentId: `matching_type-${context}`,
    dataField: "matching_type.keyword",
    title: "Informations similaires",
    filterLabel: "Informations similaires",
    selectAllLabel: "Tous",
    sortBy: "asc",
  },
  {
    componentId: `nom_academie-${context}`,
    dataField: "nom_academie.keyword",
    title: "Académie",
    filterLabel: "Académie",
    selectAllLabel: "Toutes les académies",
    sortBy: "asc",
  },
  // {
  //   componentId: `num_departement-${context}`,
  //   dataField: "num_departement.keyword",
  //   title: "Département",
  //   filterLabel: "Département",
  //   selectAllLabel: "Tous",
  //   sortBy: "asc",
  // },
  // {
  //   componentId: `tags-${context}`,
  //   dataField: "tags.keyword",
  //   title: "Année(s)",
  //   filterLabel: "Année(s)",
  //   selectAllLabel: "Toutes",
  //   sortBy: "asc",
  // },

  {
    componentId: `cfd-${context}`,
    dataField: "codes_cfd_mna.keyword",
    title: "Code diplôme",
    filterLabel: "Code diplôme",
    selectAllLabel: "Tous",
    sortBy: "asc",
  },
  {
    componentId: `rncp-${context}`,
    dataField: "codes_rncp_mna.keyword",
    title: "Code RNCP",
    filterLabel: "Code RNCP",
    selectAllLabel: "Tous",
    sortBy: "asc",
  },
  {
    componentId: `statuts-${context}`,
    dataField: "matching_mna_parcoursup_statuts.keyword",
    title: "Statuts",
    filterLabel: "Statuts",
    selectAllLabel: "Tous",
    sortBy: "asc",
  },
];

const dataSearch = {
  dataField: ["uai_gestionnaire", "id_parcoursup", "libelle_commune"],
  placeholder: "Saisissez un UAI, identifiant parcoursup ou une commune",
  fieldWeights: [3, 2, 1],
};

export default {
  FILTERS,
  columnsDefinition,
  facetDefinition,
  queryBuilderField,
  dataSearch,
};
