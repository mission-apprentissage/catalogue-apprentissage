import React, { memo, useRef, useState, useCallback } from "react";
import { DataSearch, ReactiveBase, ReactiveComponent, ReactiveList, SelectedFilters } from "@appbaseio/reactivesearch";
import { Box, Container, Flex, Text } from "@chakra-ui/react";

import useAuth from "../../hooks/useAuth";
import { hasAccessTo, hasOneOfRoles, isUserAdmin } from "../../utils/rolesUtils";
import {
  allowedFilters,
  quickFiltersDefinition,
  queryBuilderField,
  dataSearch,
  columnsDefinition,
} from "./constantsUsers";
import { CloseCircleLine } from "../../../theme/components/icons";
import { SearchLine } from "../../../theme/components/icons/SearchLine";
import { CardListUser } from "../../../pages/admin/Users";
import { ExportButton, QueryBuilder, QuickFilters } from "./components";
import { Pagination } from "./components/Pagination";

import "./search.css";

export default memo(({ searchState, extraButtons = null, roles, refreshSearchCount }) => {
  const { base, countUsers, endpoint } = searchState;
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  const [auth] = useAuth();

  const refreshSearch = useCallback(() => {
    refreshSearchCount();
    setLastRefreshTime(new Date());
  }, [refreshSearchCount]);

  const filters = quickFiltersDefinition.filter(
    ({ acl, roles, isAuth }) =>
      (!acl || hasAccessTo(auth, acl)) &&
      (!roles || hasOneOfRoles(auth, roles)) &&
      (!isAuth || (isAuth && auth?.sub !== "anonymous"))
  );

  return (
    <Box className="search-page">
      <ReactiveBase
        url={`${endpoint}/es/search`}
        app={base}
        theme={{
          typography: {
            fontFamily: "Marianne, Arial",
          },
        }}
      >
        <Box className="search" maxW="full">
          <Container maxW="7xl" p={0}>
            <Box className={`search-container`} px={[0, 0, 4]} display={"flex"}>
              <Text fontWeight="700" color="grey.800" mt={4} mb={4} textStyle="rf-text" w="15%">
                RECHERCHE LIBRE
              </Text>
              <Box px={4} w="85%" marginTop={2}>
                <DataSearch
                  componentId={`SEARCH`}
                  placeholder={dataSearch.placeholder}
                  fieldWeights={dataSearch.fieldWeights}
                  dataField={dataSearch.dataField}
                  autosuggest={true}
                  queryFormat="and"
                  size={20}
                  showFilter={false}
                  URLParams={true}
                  react={{ and: allowedFilters.filter((e) => e !== `SEARCH`) }}
                  showClear={true}
                  clearIcon={<CloseCircleLine boxSize={4} />}
                  icon={<SearchLine color={"bluefrance"} boxSize={5} />}
                  debounce={500}
                />
              </Box>
            </Box>

            <ReactiveComponent
              componentId="refresher"
              customQuery={() => ({
                query: {
                  bool: {
                    must_not: {
                      term: { dummy: String(lastRefreshTime) },
                    },
                  },
                },
              })}
            />

            {/* <Box borderTop="1px solid #E7E7E7" w="full" my={4} /> */}

            {/*
            <Box px={[0, 0, 4]} display={"flex"}>
              <Text fontWeight="700" color="grey.800" mt={4} mb={4} textStyle="rf-text" w="15%">
                RECHERCHE MULTI-CRITÈRES
              </Text>

              <Box px={2} w="85%">
                <QueryBuilder
                  collection={base}
                  react={{ and: allowedFilters.filter((e) => e !== "QUERYBUILDER") }}
                  fields={queryBuilderField}
                />
              </Box>
            </Box> */}

            <Box borderTop="1px solid #E7E7E7" w="full" my={4} />

            <Flex className="search-row" flexDirection={["column", "column", "row"]}>
              <Box className="search-sidebar" px={[0, 0, 4]}>
                <Text fontWeight="700" color="grey.800" mt={4} mb={4} textStyle="rf-text">
                  FILTRER PAR
                </Text>

                <QuickFilters filters={filters} injectedProps={{ roles }} />
              </Box>

              <Box className="search-results" px={[0, 0, 4]}>
                <Box pt={2}>
                  <SelectedFilters showClearAll={false} innerClass={{ button: "selected-filters-button" }} />
                </Box>
                <Box className={`result-view`}>
                  <ReactiveList
                    data-testid="search-results"
                    scrollOnChange={false}
                    componentId="result"
                    title="Results"
                    dataField="_id"
                    loader="Chargement des résultats.."
                    size={1000}
                    innerClass={{ pagination: "search-pagination", sortOptions: "search-sort-options" }}
                    pagination={true}
                    URLParams={true}
                    showResultStats={true}
                    sortBy="asc"
                    sortOptions={[
                      {
                        label: "Adresse courriel (asc)",
                        dataField: "email.keyword",
                        sortBy: "asc",
                      },
                      {
                        label: "Adresse courriel (desc)",
                        dataField: "email.keyword",
                        sortBy: "desc",
                      },
                      {
                        label: "Date de création (asc)",
                        dataField: "created_at",
                        sortBy: "asc",
                      },
                      {
                        label: "Date de création (desc)",
                        dataField: "created_at",
                        sortBy: "desc",
                      },
                      {
                        label: "Date de dernière connection (asc)",
                        dataField: "last_connection",
                        sortBy: "asc",
                      },
                      {
                        label: "Date de dernière connection (desc)",
                        dataField: "last_connection",
                        sortBy: "desc",
                      },
                    ]}
                    defaultQuery={() => {
                      return {
                        _source: columnsDefinition.map(({ accessor }) => accessor),
                      };
                    }}
                    renderItem={(data) => (
                      <CardListUser user={data} key={data._id} roles={roles} refreshSearch={refreshSearch} />
                    )}
                    renderResultStats={(stats) => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {`${stats.numberOfResults.toLocaleString(
                              "fr-FR"
                            )} utilisateurs sur ${countUsers.toLocaleString("fr-FR")}`}
                          </span>

                          <ExportButton
                            index={base}
                            filters={allowedFilters}
                            columns={columnsDefinition
                              .filter((def) => def.exportable)
                              .filter((def) => !def.admin || isUserAdmin(auth))
                              .map((def) => ({
                                header: def.Header,
                                fieldName: def.accessor,
                                formatter: (value, ...args) => {
                                  return def.formatter?.(value, ...args, { roles }) ?? value ?? "";
                                },
                              }))}
                          />

                          {extraButtons}
                        </div>
                      );
                    }}
                    react={{ and: ["refresher", ...allowedFilters] }}
                    renderPagination={(props) => <Pagination {...props} />}
                  />
                </Box>
              </Box>
            </Flex>
          </Container>
        </Box>
      </ReactiveBase>
    </Box>
  );
});
