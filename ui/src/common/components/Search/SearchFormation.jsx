import React from "react";
import { DataSearch, ReactiveBase, ReactiveList, SelectedFilters } from "@appbaseio/reactivesearch";
import { Box, Container, Flex, Text } from "@chakra-ui/react";

import useAuth from "../../hooks/useAuth";
import { hasAccessTo, hasOneOfRoles, isUserAdmin } from "../../utils/rolesUtils";
import { CardListFormation, ExportButton, HardFilters, QueryBuilder } from "./components";
import {
  allowedFilters,
  quickFiltersDefinition,
  queryBuilderField,
  dataSearch,
  columnsDefinition,
} from "./constantsFormations";
import { CloseCircleLine } from "../../../theme/components/icons";
import { SearchLine } from "../../../theme/components/icons/SearchLine";
import { Pagination } from "./components/Pagination";
import { CONTEXT } from "../../../constants/context";
import { QuickFilters } from "./components/QuickFilters";

import "./search.css";

export default React.memo(({ searchState, context, extraButtons = null }) => {
  const isCatalogueGeneral = context === CONTEXT.CATALOGUE_GENERAL;
  const { base, countCatalogueGeneral, countCatalogueNonEligible, endpoint } = searchState;

  const [auth] = useAuth();

  const filters = quickFiltersDefinition.filter(
    ({ acl, roles, displayInContext, isAuth }) =>
      (!displayInContext || displayInContext.includes(context)) &&
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
        <HardFilters allowedFilters={allowedFilters} context={context} isBaseFormations={true} />

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

            {/* <Box borderTop="1px solid #E7E7E7" w="full" my={4} /> */}

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
            </Box>

            <Box borderTop="1px solid #E7E7E7" w="full" my={4} />

            <Flex className="search-row" flexDirection={["column", "column", "row"]}>
              <Box className="search-sidebar" px={[0, 0, 4]}>
                <Text fontWeight="700" color="grey.800" mt={4} mb={4} textStyle="rf-text">
                  FILTRER PAR
                </Text>

                <QuickFilters filters={filters} context={context} />
              </Box>

              <Box className="search-results" px={[0, 0, 4]}>
                <Box pt={2}>
                  <SelectedFilters showClearAll={false} innerClass={{ button: "selected-filters-button" }} />
                </Box>
                <Box className={`result-view`}>
                  <ReactiveList
                    scrollOnChange={false}
                    componentId="result"
                    title="Results"
                    dataField="_id"
                    loader="Chargement des résultats.."
                    size={8}
                    innerClass={{ pagination: "search-pagination", sortOptions: "search-sort-options" }}
                    pagination={true}
                    URLParams={true}
                    showResultStats={true}
                    sortBy="asc"
                    sortOptions={[
                      {
                        label: "Tri par défaut",
                        dataField: "_score",
                        sortBy: "desc",
                      },
                      {
                        label: "Académie",
                        dataField: "nom_academie.keyword",
                        sortBy: "asc",
                      },
                      {
                        label: "Formation - libellé long",
                        dataField: "intitule_long.keyword",
                        sortBy: "asc",
                      },
                      {
                        label: "Formation - CFD",
                        dataField: "cfd.keyword",
                        sortBy: "asc",
                      },
                      {
                        label: "Organisme - UAI du responsable",
                        dataField: "etablissement_gestionnaire_uai.keyword",
                        sortBy: "asc",
                      },
                      {
                        label: "Organisme - UAI du formateur",
                        dataField: "etablissement_formateur_uai.keyword",
                        sortBy: "asc",
                      },
                      {
                        label: "Organisme - UAI du lieu de formation",
                        dataField: "uai_formation.keyword",
                        sortBy: "asc",
                      },
                      {
                        label: "Lieu - code Insee",
                        dataField: "code_commune_insee.keyword",
                        sortBy: "asc",
                      },
                    ]}
                    defaultQuery={() => {
                      return {
                        _source: columnsDefinition.map(({ accessor }) => accessor),
                      };
                    }}
                    renderItem={(data) => <CardListFormation data={data} key={data._id} />}
                    renderResultStats={(stats) => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {isCatalogueGeneral &&
                              `${stats.numberOfResults.toLocaleString(
                                "fr-FR"
                              )} formations sur ${countCatalogueGeneral.total.toLocaleString("fr-FR")}`}
                            {!isCatalogueGeneral &&
                              `${stats.numberOfResults.toLocaleString(
                                "fr-FR"
                              )} formations sur ${countCatalogueNonEligible.total.toLocaleString("fr-FR")}`}
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
                                formatter: def.formatter,
                              }))}
                            context={context}
                          />

                          {extraButtons}
                        </div>
                      );
                    }}
                    react={{ and: allowedFilters }}
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
