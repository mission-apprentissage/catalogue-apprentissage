import { escapeDiacritics } from "../../utils/downloadUtils";

const FILTERS = (context) => {
  const filters = [
    `QUERYBUILDER`,
    `SEARCH`,
    "libelle_formation",
    `nom_academie`,
    `matching_type`,
    "statut_reconciliation",
    `rncp`,
    `cfd`,
    `statuts`,
  ];
  return filters;
};

const columnsDefinition = [
  {
    Header: "Identifiant ParcourSup",
    accessor: "id_parcoursup",
    width: 200,
    editable: false,
    exportable: true,
  },
  {
    Header: "Nom de l'academie",
    accessor: "nom_academie",
    width: 200,
    exportable: true,
    editable: false,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Code du diplome PS",
    accessor: "codes_cfd_mna",
    width: 400,
    exportable: true,
    editable: false,
  },
  {
    Header: "Libelle de la formation",
    accessor: "libelle_formation",
    width: 400,
    exportable: true,
    editable: false,
  },
  {
    Header: "Libelle spécialité",
    accessor: "libelle_specialite",
    width: 400,
    exportable: true,
    editable: false,
  },
  {
    Header: "Code postal",
    accessor: "code_postal",
    width: 120,
    exportable: true,
    editable: false,
  },
  {
    Header: "Localite",
    accessor: "libelle_commune",
    width: 200,
    exportable: true,
    editable: false,
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Informations similaires",
    accessor: "matching_type",
    width: 120,
    exportable: false,
    editable: false,
  },
  {
    Header: "match",
    accessor: "matching_mna_formation",
    width: 200,
    exportable: true,
    editable: false,
    formatter: (values, formation) => {
      const result = [];
      for (let index = 0; index < values.length; index++) {
        const { _id, intitule_court } = values[index];
        result.push(
          JSON.stringify({
            url_mna: `http://catalogue.apprentissage.beta.gouv.fr/formation/${_id}`,
            intitule_court,
          })
        );
      }

      return result.join(", ");
    },
  },
  {
    Header: "matching_mna_parcoursup_statuts",
    accessor: "matching_mna_parcoursup_statuts",
    width: 200,
    exportable: false,
    editable: false,
  },
  {
    Header: "statut_reconciliation",
    accessor: "statut_reconciliation",
    width: 200,
    exportable: false,
    editable: false,
  },
  {
    Header: "Raison(s) rejet",
    accessor: "rapprochement_rejete_raisons",
    width: 200,
    exportable: true,
    editable: false,
    formatter: (values) => {
      return values.join(", ");
    },
  },
  {
    Header: "Détails rejet",
    accessor: "rapprochement_rejete_raison_autre",
    width: 200,
    exportable: true,
    editable: false,
  },
  {
    Header: "Uai Gestionnaire",
    accessor: "uai_gestionnaire",
    width: 120,
    exportable: true,
    editable: false,
  },
  {
    Header: "Uai Composante",
    accessor: "uai_composante",
    width: 120,
    exportable: true,
    editable: false,
  },
  {
    Header: "Uai Affilié",
    accessor: "uai_affilie",
    width: 120,
    exportable: true,
    editable: false,
  },
  {
    Header: "Siret sur Cerfa",
    accessor: "siret_cerfa",
    width: 120,
    exportable: true,
    editable: false,
  },
  {
    Header: "Nom établissement uai composante",
    accessor: "libelle_uai_composante",
    width: 120,
    exportable: true,
    editable: false,
  },
  {
    Header: "Adresse",
    accessor: "complement_adresse_1",
    width: 120,
    exportable: true,
    editable: false,
  },
  {
    Header: "clé ministere educatif ",
    accessor: "cle_ministere_educatif",
    width: 200,
    exportable: true,
    editable: false,
  },
];

const queryBuilderField = [
  { text: "Identifiant parcoursup", value: "id_parcoursup.keyword" },
  // { text: "Nom academie", value: "nom_academie.keyword" },
];

const facetDefinition = (context) => {
  const base = [
    {
      componentId: `matching_type`,
      dataField: "matching_type.keyword",
      title: "Informations similaires",
      filterLabel: "Informations similaires",
      selectAllLabel: "Tous",
      sortBy: "desc",
    },
    {
      componentId: `nom_academie`,
      dataField: "nom_academie.keyword",
      title: "Académie",
      filterLabel: "Académie",
      selectAllLabel: "Toutes les académies",
      sortBy: "asc",
    },
    {
      componentId: `cfd`,
      dataField: "codes_cfd_mna.keyword",
      title: "Code diplôme",
      filterLabel: "Code diplôme",
      selectAllLabel: "Tous",
      sortBy: "asc",
    },
    {
      componentId: `rncp`,
      dataField: "codes_rncp_mna.keyword",
      title: "Code RNCP",
      filterLabel: "Code RNCP",
      selectAllLabel: "Tous",
      sortBy: "asc",
    },
    {
      componentId: `libelle_formation`,
      dataField: "libelle_formation.keyword",
      title: "Libellé formation",
      filterLabel: "Libellé formation",
      selectAllLabel: "Tous",
      sortBy: "asc",
    },
  ];

  return context !== "reconciliation_ps_valides"
    ? [
        ...base,
        {
          componentId: `statuts`,
          dataField: "matching_mna_parcoursup_statuts.keyword",
          title: "Statuts",
          filterLabel: "Statuts",
          selectAllLabel: "Tous",
          sortBy: "asc",
        },
      ]
    : [...base];
};

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
