import { escapeDiacritics } from "../../utils/downloadUtils";
import { ACADEMIES } from "../../../constants/academies";
import { REGIONS } from "../../../constants/regions";
import { hasAccessTo, hasOneOfRoles } from "../../utils/rolesUtils";

export const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;
export const allowedFilters = [
  "QUERYBUILDER",
  "SEARCH",
  "username",
  "email",
  "roles",
  "acl",
  "acl-publication-ou-lecture-seule",
  "acl-affelnet",
  "acl-perimetre-affelnet",
  "acl-parcoursup",
  "acl-perimetre-parcoursup",
  "tag",
  "tag_1",
  "tag_2",
  "fonction",
  "isAdmin",
  "academie",
  "region",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "last_connection_start",
  "last_connection_end",
];

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

const structureUser = (user, roles) => {
  const rolesAcl = roles
    .filter((role) => user.roles.find((r) => role.name === r))
    .reduce((acc, { acl }) => [...acc, ...acl], []);

  // console.log({
  //   roles,
  //   user,
  //   userAcl: user.acl,
  //   userRoles: user.roles,
  //   allAcl: [...new Set([...user.acl, rolesAcl])],
  // });

  return { ...user, acl: [...new Set([...user.acl, ...rolesAcl])] };
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
    Header: "Droits de publication ou en lecture seule",
    accessor: "acl",
    width: 200,
    exportable: true,
    formatter: (acl, user, { roles }) =>
      hasAccessTo(structureUser(user, roles), "page_formation/gestion_publication") ? "publication" : "lecture seule",
  },

  {
    Header: "Accès aux offres du périmètre Affelnet",
    accessor: "acl",
    width: 200,
    exportable: true,
    formatter: (acl, user, { roles }) =>
      booleanFormatter(hasOneOfRoles(structureUser(user, roles), ["instructeur-affelnet", "lecteur-affelnet"])),
  },

  {
    Header: "Droit d'accès aux règles académiques d'inclusion des offres dans le périmètre Affelnet",
    accessor: "acl",
    width: 200,
    exportable: true,
    formatter: (acl, user, { roles }) =>
      booleanFormatter(hasAccessTo(structureUser(user, roles), "page_perimetre/affelnet")),
  },

  {
    Header: "Accès aux offres du périmètre Parcoursup",
    accessor: "acl",
    width: 200,
    exportable: true,
    formatter: (acl, user, { roles }) =>
      booleanFormatter(hasOneOfRoles(structureUser(user, roles), ["instructeur-parcoursup", "lecteur-parcoursup"])),
  },

  // {
  //   Header: "Droit d'accès aux règles académiques d'inclusion des offres dans le périmètre Parcoursup",
  //   accessor: "acl",
  //   width: 200,
  //   exportable: true,
  //   formatter: (acl, user, { roles }) =>
  //     booleanFormatter(hasAccessTo(structureUser(user, roles), "page_perimetre/parcoursup")),
  // },

  {
    Header: "Date de création",
    accessor: "created_at",
    width: 200,
    exportable: true,
    formatter: dateFormatter,
  },

  {
    Header: "Créé par",
    accessor: "created_by",
    width: 200,
    exportable: true,
    formatter: escapeDiacritics,
  },

  {
    Header: "Date de dernière modification",
    accessor: "updated_at",
    width: 200,
    exportable: true,
    formatter: dateFormatter,
  },

  {
    Header: "Modifié par",
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

  { type: "divider" },

  {
    componentId: `region`,
    type: "facet",
    dataField: "academie.keyword",
    title: "Région",
    filterLabel: "Région",
    selectAllLabel: "Toutes les régions",
    sortBy: "asc",

    transformData: (data) => {
      return Object.entries({ ...{ "-1": { nom_region: "N/A", num_region: -1, academies: ["-1"] } }, ...REGIONS })
        .sort(([aKey, aValue], [bKey, bValue]) => aValue.num_region - bValue.num_region)
        .map(([regionKey, regionValue]) => ({
          key: regionValue.nom_region,
          doc_count: data
            .filter(
              ({ key, doc_count }) => !!regionValue.academies.some((academie) => key.split(",")?.includes(academie))
            )
            .reduce((acc, { key, doc_count }) => acc + doc_count, 0),
        }))
        .filter(({ key, doc_count }) => !!doc_count);
    },

    customQuery: (values) => {
      return {
        query:
          values?.length && !values?.find((value) => value === "Toutes les régions")
            ? {
                bool: {
                  minimum_should_match: 1,
                  should: values
                    .flatMap((value) =>
                      Object.entries({ "-1": { nom_region: "N/A", num_region: -1, academies: ["-1"] }, ...REGIONS })
                        .filter(([k, v]) => v.nom_region === value)
                        ?.flatMap(([k, v]) => v.academies)
                    )
                    .map((value) => ({
                      wildcard: {
                        "academie.keyword": "*" + value + "*",
                      },
                    })),
                },
              }
            : {},
      };
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
      return Object.entries({
        ...{ "-1": { nom_academie: "N/A", num_academie: -1 } },
        ...ACADEMIES,
      })
        .sort(([aKey, aValue], [bKey, bValue]) => aValue.num_academie - bValue.num_academie)
        .map(([academieKey, academieValue]) => ({
          key: academieValue.nom_academie,
          doc_count: data
            .filter(({ key, doc_count }) => !!key.split(",")?.includes(academieKey))
            .reduce((acc, { key, doc_count }) => acc + doc_count, 0),
        }))
        .filter(({ key, doc_count }) => !!doc_count);
    },

    customQuery: (values) => {
      return {
        query:
          values?.length && !values?.find((value) => value === "Toutes les académies")
            ? {
                bool: {
                  minimum_should_match: 1,
                  should: values
                    .flatMap((value) =>
                      Object.entries({ "-1": { nom_academie: "N/A", num_academie: -1 }, ...ACADEMIES })
                        .filter(([k, v]) => v.nom_academie === value)
                        ?.map(([k, v]) => k)
                    )
                    .map((value) => ({
                      wildcard: {
                        "academie.keyword": "*" + value + "*",
                      },
                    })),
                },
              }
            : {},
      };
    },
  },

  { type: "divider" },

  {
    componentId: `roles`,
    type: "facet",
    dataField: "roles.keyword",
    title: "Rôle",
    filterLabel: "Rôle",
    selectAllLabel: "Tous les rôles",
    sortBy: "asc",
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
    componentId: `tag_1`,
    type: "facet",
    dataField: "tag_1.keyword",
    title: "Tag 1",
    filterLabel: "Tag 1",
    selectAllLabel: "Tous les tags",
    sortBy: "asc",
  },
  {
    componentId: `tag_2`,
    type: "facet",
    dataField: "tag_2.keyword",
    title: "Tag 2",
    filterLabel: "Tag 2",
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
    transformData: (data) => {
      return [{ key: "Non renseignée", doc_count: null }, ...data];
    },
    customQuery: (values) => {
      if (values.length > 0 && !values.find((value) => value === "Toutes les fonctions")) {
        return {
          query: {
            bool: {
              should: [
                ...values.map((value) => ({
                  match: {
                    "fonction.keyword": value === "Non renseignée" ? "" : value,
                  },
                })),
                ...(values.find((v) => v === "Non renseignée")
                  ? [
                      {
                        bool: {
                          must_not: {
                            exists: {
                              field: "fonction",
                            },
                          },
                        },
                      },
                    ]
                  : []),
              ],
              minimum_should_match: 1,
            },
          },
        };
      }
    },
  },

  { type: "divider" },

  {
    componentId: "acl-publication-ou-lecture-seule",
    type: "facet",
    dataField: "acl.keyword",
    title: "Droit de publication ou lecture seule",
    filterLabel: "Droit de publication ou lecture seule",
    selectAllLabel: "Toutes les valeurs",
    sortBy: "asc",

    transformData: () => {
      return [
        { key: "Publication", doc_count: null },
        { key: "Lecture seule", doc_count: null },
      ];
    },

    customQuery: (values, filterDefinition, injectedProps) => {
      const { roles } = injectedProps;

      const authorizedRoles = new Set(
        roles?.filter((role) => role.acl.includes("page_formation/gestion_publication")).map((role) => role.name)
      );

      if (values.length === 0 || values.length === 2) {
        return {
          query: {},
        };
      }

      switch (values[0]) {
        case "Publication":
          return {
            query: {
              bool: {
                minimum_should_match: 1,
                should: [
                  {
                    match: {
                      isAdmin: true,
                    },
                  },
                  {
                    match: {
                      "acl.keyword": "page_formation/gestion_publication",
                    },
                  },
                  ...[...authorizedRoles].map((role) => ({
                    match: {
                      "roles.keyword": role,
                    },
                  })),
                ],
              },
            },
          };
        case "Lecture seule":
          return {
            query: {
              bool: {
                must_not: {
                  bool: {
                    minimum_should_match: 1,
                    should: [
                      {
                        match: {
                          isAdmin: true,
                        },
                      },
                      {
                        match: {
                          "acl.keyword": "page_formation/gestion_publication",
                        },
                      },
                      ...[...authorizedRoles].map((role) => ({
                        match: {
                          "roles.keyword": role,
                        },
                      })),
                    ],
                  },
                },
              },
            },
          };
        default:
          return {
            query: {},
          };
      }
    },
  },

  { type: "divider" },

  {
    componentId: "acl-affelnet",
    type: "facet",
    dataField: "acl.keyword",
    title: "Accès aux offres du périmètre Affelnet",
    filterLabel: "Accès aux offres du périmètre Affelnet",
    selectAllLabel: "Toutes les valeurs",
    sortBy: "asc",

    transformData: () => {
      return [
        { key: "Oui", doc_count: null },
        { key: "Non", doc_count: null },
      ];
    },

    customQuery: (values) => {
      if (values.length === 0 || values.length === 2) {
        return {
          query: {},
        };
      }

      // const { roles } = injectedProps;

      // const authorizedAcls = ["page_catalogue/voir_filtres_aff"];

      // const authorizedRoles = new Set(
      //   roles?.filter((role) => authorizedAcls.some((acl) => role.acl.includes(acl))).map((role) => role.name)
      // );

      // console.log({ roles, authorizedAcls, authorizedRoles });

      const authorizedRoles = ["instructeur-affelnet", "lecteur-affelnet"];

      switch (values[0]) {
        case "Oui":
          return {
            query: {
              bool: {
                minimum_should_match: 1,
                should: [
                  {
                    match: {
                      isAdmin: true,
                    },
                  },
                  // ...authorizedAcls.map((acl) => ({
                  //   match: {
                  //     "acl.keyword": acl,
                  //   },
                  // })),
                  ...[...authorizedRoles].map((role) => ({
                    match: {
                      "roles.keyword": role,
                    },
                  })),
                ],
              },
            },
          };
        case "Non":
          return {
            query: {
              bool: {
                must_not: {
                  bool: {
                    minimum_should_match: 1,
                    should: [
                      {
                        match: {
                          isAdmin: true,
                        },
                      },
                      // ...authorizedAcls.map((acl) => ({
                      //   match: {
                      //     "acl.keyword": acl,
                      //   },
                      // })),
                      ...[...authorizedRoles].map((role) => ({
                        match: {
                          "roles.keyword": role,
                        },
                      })),
                    ],
                  },
                },
              },
            },
          };
        default:
          return {
            query: {},
          };
      }
    },
  },

  {
    componentId: "acl-perimetre-affelnet",
    type: "facet",
    dataField: "acl.keyword",
    title: "Droit d'accès aux règles académique d'inclusion des offres dans le périmètre Affelnet",
    filterLabel: "Droit d'accès aux règles académique d'inclusion des offres dans le périmètre Affelnet",
    selectAllLabel: "Toutes les valeurs",
    sortBy: "asc",

    transformData: () => {
      return [
        { key: "Oui", doc_count: null },
        { key: "Non", doc_count: null },
      ];
    },

    customQuery: (values, filterDefinition, injectedProps) => {
      if (values.length === 0 || values.length === 2) {
        return {
          query: {},
        };
      }

      const { roles } = injectedProps;

      const authorizedAcls = ["page_perimetre/affelnet"];

      const authorizedRoles = new Set(
        roles?.filter((role) => authorizedAcls.some((acl) => role.acl.includes(acl))).map((role) => role.name)
      );

      // console.log({ roles, authorizedAcls, authorizedRoles });

      switch (values[0]) {
        case "Oui":
          return {
            query: {
              bool: {
                minimum_should_match: 1,
                should: [
                  {
                    match: {
                      isAdmin: true,
                    },
                  },
                  ...authorizedAcls.map((acl) => ({
                    match: {
                      "acl.keyword": acl,
                    },
                  })),
                  ...[...authorizedRoles].map((role) => ({
                    match: {
                      "roles.keyword": role,
                    },
                  })),
                ],
              },
            },
          };
        case "Non":
          return {
            query: {
              bool: {
                must_not: {
                  bool: {
                    minimum_should_match: 1,
                    should: [
                      {
                        match: {
                          isAdmin: true,
                        },
                      },
                      ...authorizedAcls.map((acl) => ({
                        match: {
                          "acl.keyword": acl,
                        },
                      })),
                      ...[...authorizedRoles].map((role) => ({
                        match: {
                          "roles.keyword": role,
                        },
                      })),
                    ],
                  },
                },
              },
            },
          };
        default:
          return {
            query: {},
          };
      }
    },
  },

  { type: "divider" },

  {
    componentId: "acl-parcoursup",
    type: "facet",
    dataField: "roles.keyword",
    title: "Accès aux offres du périmètre Parcoursup",
    filterLabel: "Accès aux offres du périmètre Parcoursup",
    selectAllLabel: "Toutes les valeurs",
    sortBy: "asc",

    transformData: () => {
      const authorizedRoles = ["instructeur-parcoursup", "lecteur-parcoursup"];

      return [
        { key: "Oui", doc_count: null },
        { key: "Non", doc_count: null },
      ];
    },

    customQuery: (values) => {
      if (values.length === 0 || values.length === 2) {
        return {
          query: {},
        };
      }

      // const { roles } = injectedProps;

      // const authorizedAcls = ["page_catalogue/voir_filtres_ps"];

      // const authorizedRoles = new Set(
      //   roles?.filter((role) => authorizedAcls.some((acl) => role.acl.includes(acl))).map((role) => role.name)
      // );

      // console.log({ roles, authorizedAcls, authorizedRoles });

      const authorizedRoles = ["instructeur-parcoursup", "lecteur-parcoursup"];

      switch (values[0]) {
        case "Oui":
          return {
            query: {
              bool: {
                minimum_should_match: 1,
                should: [
                  {
                    match: {
                      isAdmin: true,
                    },
                  },
                  // ...authorizedAcls.map((acl) => ({
                  //   match: {
                  //     "acl.keyword": acl,
                  //   },
                  // })),
                  ...[...authorizedRoles].map((role) => ({
                    match: {
                      "roles.keyword": role,
                    },
                  })),
                ],
              },
            },
          };
        case "Non":
          return {
            query: {
              bool: {
                must_not: {
                  bool: {
                    minimum_should_match: 1,
                    should: [
                      {
                        match: {
                          isAdmin: true,
                        },
                      },

                      // ...authorizedAcls.map((acl) => ({
                      //   match: {
                      //     "acl.keyword": acl,
                      //   },
                      // })),
                      ...[...authorizedRoles].map((role) => ({
                        match: {
                          "roles.keyword": role,
                        },
                      })),
                    ],
                  },
                },
              },
            },
          };
        default:
          return {
            query: {},
          };
      }
    },
  },

  // {
  //   componentId: "acl-perimetre-parcoursup",
  //   type: "facet",
  //   dataField: "acl.keyword",
  //   title: "Droit d'accès aux règles académique d'inclusion des offres dans le périmètre Parcoursup",
  //   filterLabel: "Droit d'accès aux règles académique d'inclusion des offres dans le périmètre Parcoursup",
  //   selectAllLabel: "Toutes les valeurs",
  //   sortBy: "asc",

  //   transformData: () => {
  //     return [
  //       { key: "Oui", doc_count: null },
  //       { key: "Non", doc_count: null },
  //     ];
  //   },

  //   customQuery: (values, filterDefinition, injectedProps) => {
  //     if (values.length === 0 || values.length === 2) {
  //       return {
  //         query: {},
  //       };
  //     }

  //     const { roles } = injectedProps;

  //     const authorizedAcls = ["page_perimetre/parcoursup"];

  //     const authorizedRoles = new Set(
  //       roles?.filter((role) => authorizedAcls.some((acl) => role.acl.includes(acl))).map((role) => role.name)
  //     );

  //     // console.log({ roles, authorizedAcls, authorizedRoles });

  //     switch (values[0]) {
  //       case "Oui":
  //         return {
  //           query: {
  //             bool: {
  //               minimum_should_match: 1,
  //               should: [
  //                 {
  //                   match: {
  //                     isAdmin: true,
  //                   },
  //                 },
  //                 ...authorizedAcls.map((acl) => ({
  //                   match: {
  //                     "acl.keyword": acl,
  //                   },
  //                 })),
  //                 ...[...authorizedRoles].map((role) => ({
  //                   match: {
  //                     "roles.keyword": role,
  //                   },
  //                 })),
  //               ],
  //             },
  //           },
  //         };
  //       case "Non":
  //         return {
  //           query: {
  //             bool: {
  //               must_not: {
  //                 bool: {
  //                   minimum_should_match: 1,
  //                   should: [
  //                     {
  //                       match: {
  //                         isAdmin: true,
  //                       },
  //                     },
  //                     ...authorizedAcls.map((acl) => ({
  //                       match: {
  //                         "acl.keyword": acl,
  //                       },
  //                     })),
  //                     ...[...authorizedRoles].map((role) => ({
  //                       match: {
  //                         "roles.keyword": role,
  //                       },
  //                     })),
  //                   ],
  //                 },
  //               },
  //             },
  //           },
  //         };
  //       default:
  //         return {
  //           query: {},
  //         };
  //     }
  //   },
  // },

  { type: "divider" },

  {
    componentId: `last_connection`,
    type: "date-range",
    dataField: "last_connection",
    title: "Date de dernière connexion",
    filterLabel: "Date de dernière connexion",
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
