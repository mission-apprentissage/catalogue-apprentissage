import { escapeDiacritics } from "../../utils/downloadUtils";
import helpText from "../../../locales/helpText.json";

const FILTERS = () => [`QUERYBUILDER`, `SEARCH`, `num_departement`, `nom_academie`, `tags`, "published", "qualiopi"];

const columnsDefinition = [
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
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "Raison sociale de l'entreprise",
    accessor: "entreprise_raison_sociale",
    width: 200,
    exportable: true,
    formatter: (value) => escapeDiacritics(value),
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
    Header: "Qualiopi ?",
    accessor: "info_qualiopi_info",
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
    formatter: (value) => escapeDiacritics(value),
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
    formatter: (value) => escapeDiacritics(value),
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
    formatter: (value) => escapeDiacritics(value),
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
    formatter: (value) => escapeDiacritics(value),
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
    formatter: (value) => escapeDiacritics(value),
  },
  {
    Header: "A des formations de niveau 3",
    accessor: "formations_n3",
    width: 200,
    exportable: false,
  },
  {
    Header: "A des formations de niveau 4",
    accessor: "formations_n4",
    width: 200,
    exportable: false,
  },
  {
    Header: "A des formations de niveau 5",
    accessor: "formations_n5",
    width: 200,
    exportable: false,
  },
  {
    Header: "A des formations de niveau 6",
    accessor: "formations_n6",
    width: 200,
    exportable: false,
  },
  {
    Header: "A des formations de niveau 7",
    accessor: "formations_n7",
    width: 200,
    exportable: false,
  },
  {
    Header: "A des formations de niveau 3",
    accessor: "formations_n3",
    width: 200,
    exportable: false,
  },
  {
    Header: "A des formations de niveau 4",
    accessor: "formations_n4",
    width: 200,
    exportable: true,
  },
  {
    Header: "A des formations de niveau 5",
    accessor: "formations_n5",
    width: 200,
    exportable: true,
  },
  {
    Header: "A des formations de niveau 6",
    accessor: "formations_n6",
    width: 200,
    exportable: true,
  },
  {
    Header: "A des formations de niveau 7",
    accessor: "formations_n7",
    width: 200,
    exportable: true,
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
    formatter: (tags) => tags?.sort((a, b) => a - b),
  },
];

const queryBuilderField = [
  { text: "Raison sociale", value: "entreprise_raison_sociale.keyword" },
  { text: "Siret", value: "siret.keyword" },
  { text: "Certifié qualiopi", value: "info_qualiopi_info.keyword" },
  { text: "Uai", value: "uai.keyword" },
  { text: "Nda", value: "nda.keyword" },
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
    componentId: `num_departement`,
    dataField: "num_departement.keyword",
    title: "Département",
    filterLabel: "Département",
    selectAllLabel: "Tous",
    sortBy: "asc",
  },
  {
    componentId: `tags`,
    dataField: "tags.keyword",
    title: "Année(s)",
    filterLabel: "Année(s)",
    selectAllLabel: "Toutes",
    sortBy: "asc",
    helpTextSection: helpText.search.tags,
  },
  {
    componentId: `qualiopi`,
    dataField: "catalogue_published",
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
              catalogue_published: values[0] === "Oui",
            },
          },
        };
      }
      return {};
    },
  },
];

const dataSearch = {
  dataField: ["entreprise_raison_sociale", "uai", "siret"],
  placeholder: "Saisissez une raison sociale, un UAI, ou un numéro de Siret",
  fieldWeights: [3, 2, 1],
};

export default {
  FILTERS,
  columnsDefinition,
  facetDefinition,
  queryBuilderField,
  dataSearch,
};
