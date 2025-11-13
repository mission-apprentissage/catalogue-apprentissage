import { escapeDiacritics } from "../../utils/downloadUtils";
import helpText from "../../../locales/helpText.json";
import { ACADEMIES } from "../../../constants/academies";
import { REGIONS } from "../../../constants/regions";

export const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;
export const allowedFilters = [
  "QUERYBUILDER",
  "SEARCH",
  "username",
  "email",
  "roles",
  "tag",
  "fonction",
  "isAdmin",
  "academie",
  "created_at",
  "last_connection",
];

const mefsFormatter = (mefs) => {
  return mefs?.map((mef) => `${mef.mef10}`).join(", ") ?? "";
};

const arrayFormatter = (values) => {
  return values?.join(", ") ?? "";
};

const dateFormatter = (value) => (value ? new Date(value).toLocaleDateString() : "");

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

/**
 * Colonnes inclues dans l'export CSV
 */
export const columnsDefinition = [
  /**
   * Identifiants offre
   */
  {
    Header: "Nom d'utilisateur",
    accessor: "username",
    width: 200,
    exportable: true,
  },
  {
    Header: "Adresse courriel",
    accessor: "email",
    width: 200,
    exportable: true,
  },
  {
    Header: "Académie",
    accessor: "academie",
    width: 200,
    exportable: true,
    formatter: (values) =>
      values
        .split(",")
        .filter((value) => +value !== -1)
        .map((value) => ACADEMIES[value]?.nom_academie ?? value),
  },
  {
    Header: "Région académique",
    accessor: "academie",
    width: 200,
    exportable: true,
    formatter: (values) => [
      ...new Set(
        values
          .split(",")
          .filter((value) => +value !== -1)
          .map((value) => Object.values(REGIONS).find((region) => region.academies?.includes(value))?.nom_region)
      ),
    ],
  },

  {
    Header: "Droits de publication ou en lecture seule",
    accessor: "tag",
    width: 200,
    exportable: true,
  },

  {
    Header: "Tag",
    accessor: "tag",
    width: 200,
    exportable: true,
  },
  {
    Header: "Fonction",
    accessor: "fonction",
    width: 200,
    exportable: true,
  },
  {
    Header: "Rôle",
    accessor: "roles",
    width: 200,
    exportable: true,
    formatter: arrayFormatter,
  },
  {
    Header: "Droits supplémentaires",
    accessor: "acl",
    width: 200,
    exportable: true,
    formatter: arrayFormatter,
  },
  {
    Header: "Date de création",
    accessor: "created_at",
    width: 200,
    exportable: true,
    formatter: dateFormatter,
  },

  {
    Header: "Créer par",
    accessor: "created_by",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },

  {
    Header: "Date de dernière modidication",
    accessor: "updated_at",
    width: 200,
    exportable: true,
    formatter: dateFormatter,
  },

  {
    Header: "Modifier par",
    accessor: "updated_by",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },

  {
    Header: "Date de la dernière connexion",
    accessor: "last_connection",
    width: 200,
    exportable: true,
    formatter: dateFormatter,
  },
];

/**
 * Champs de la recherche avancée
 */
export const queryBuilderField = [
  {
    text: "Adresse courriel",
    value: "email.keyword",
  },
  {
    text: "Nom d'utilisateur",
    value: "username.keyword",
  },

  {
    text: "Tag",
    value: "tag.keyword",
  },
  {
    text: "Fonction",
    value: "fonction.keyword",
  },
];

/**
 * Champs de la recherche rapide
 */
export const quickFiltersDefinition = [
  {
    componentId: `isAdmin`,
    type: "facet",
    dataField: "isAdmin",
    title: "Administrateur",
    filterLabel: "Administrateur",
    selectAllLabel: "Tous",
    sortBy: "asc",
    transformData: (data) => data.map((d) => ({ ...d, key: d.key ? "Oui" : "Non" })),
    customQuery: (values) => {
      if (values.length === 1 && values[0] !== "Tous") {
        return {
          query: {
            match: {
              isAdmin: values[0] === "Oui",
            },
          },
        };
      }
      return {};
    },
  },

  {
    componentId: `academie`,
    type: "facet",
    dataField: "academie.keyword",
    title: "Académie",
    filterLabel: "Académie",
    selectAllLabel: "Toutes les académies",
    sortBy: "asc",
    transformData: (data) => {
      const academies = new Map();

      data.forEach((d) => {
        d.key?.split(",").forEach((value) => {
          const academie = academies.get(value);
          academies.set(value, {
            key: ACADEMIES[value]?.nom_academie ?? "N/A",
            doc_count: (academie?.doc_count ?? 0) + d.doc_count,
          });
        });
      });

      return [...academies.values()];
    },
    customQuery: (values) => {
      return {
        query:
          values?.length && !values?.find((value) => value === "Toutes les académies")
            ? {
                terms: {
                  "academie.keyword": values.flatMap((value) =>
                    Object.entries({ ...ACADEMIES, "N/A": { nom_academie: "N/A", num_academie: -1 } })
                      .filter(([k, v]) => v.nom_academie === value)
                      ?.map(([k, v]) => (k === "N/A" ? "-1" : k))
                  ),
                },
              }
            : {},
      };
    },
  },

  // { type: "divider" },

  {
    componentId: `roles`,
    type: "facet",
    dataField: "roles.keyword",
    title: "Rôle",
    filterLabel: "Rôle",
    selectAllLabel: "Tous les rôles",
    sortBy: "asc",
    // formatter: arrayFormatter,
  },

  {
    componentId: `tag`,
    type: "facet",
    dataField: "tag.keyword",
    title: "Tag",
    filterLabel: "Tag",
    selectAllLabel: "Tous les tags",
    sortBy: "asc",
  },

  {
    componentId: `fonction`,
    type: "facet",
    dataField: "fonction.keyword",
    title: "Fonction",
    filterLabel: "Fonction",
    selectAllLabel: "Toutes les fonctions",
    sortBy: "asc",
  },
];

export const dataSearch = {
  dataField: ["email", "username", "tag", "fonction"],
  placeholder: "Saisissez votre recherche",
  fieldWeights: [5, 4, 3, 2],
};

export default {
  allowedFilters,
  columnsDefinition,
  quickFiltersDefinition,
  queryBuilderField,
  dataSearch,
};
