import React, { useState } from "react";
import { ReactiveBase, ReactiveList, DataSearch, SelectedFilters } from "@appbaseio/reactivesearch";
import { Container, Flex, Box, Heading, Text, Spinner, Switch } from "@chakra-ui/react";
// import Switch from "react-switch";
import useAuth from "../../hooks/useAuth";
import { hasOneOfRoles } from "../../utils/rolesUtils";
import {
  QueryBuilder,
  CardListFormation,
  CardListEtablissements,
  Facet,
  ExportButton,
  HardFilters,
} from "./components";
import constantsRcoFormations from "./constantsRCOFormations";
import constantsEtablissements from "./constantsEtablissements";
import "./search.css";
import queryString from "query-string";

export default React.memo(({ match, location, searchState, context }) => {
  const { defaultMode } = queryString.parse(location.search);
  const [mode, setMode] = useState(defaultMode ?? "simple");
  const isCatalogueGeneral = context === "catalogue_general";
  const {
    loaded,
    base,
    countEtablissement,
    countCatalogueGeneral,
    countCatalogueNonEligible,
    isBaseFormations,
    endpoint,
  } = searchState;

  let [auth] = useAuth();

  const { FILTERS, facetDefinition, queryBuilderField, dataSearch, columnsDefinition } = isBaseFormations
    ? constantsRcoFormations
    : constantsEtablissements;

  const handleSearchSwitchChange = () => {
    setMode((prevValue) => (prevValue === "simple" ? "advanced" : "simple"));
  };

  if (!loaded) {
    return (
      <Box className="search-page" h="full">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box className="search-page" h="full">
      <ReactiveBase url={`${endpoint}/es/search`} app={base}>
        <HardFilters filters={FILTERS} context={context} isBaseFormations={isBaseFormations} />
        <div className="search">
          <Container maxW="full" px={0}>
            {mode === "simple" && (
              <div className={`search-container search-container-${mode}`}>
                <DataSearch
                  componentId="SEARCH"
                  placeholder={dataSearch.placeholder}
                  fieldWeights={dataSearch.fieldWeights}
                  dataField={dataSearch.dataField}
                  autosuggest={true}
                  queryFormat="and"
                  size={20}
                  showFilter={true}
                  filterLabel="recherche"
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                />
              </div>
            )}
            <Box mt={4} mb={4}>
              <Switch color="bluefrance" size="sm" onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
              <Text as="span" textStyle="sm">
                Recherche avancée
              </Text>
            </Box>
            <Box borderTop="1px solid #E7E7E7" w="full" />
            <Text fontWeight="700" color="grey.800" mt={4} mb={4} textStyle="rf-text">
              FILTRER
            </Text>
            <Flex className="search-row" flexDirection={["column", "row"]}>
              <div className={`search-sidebar`}>
                {facetDefinition
                  .filter(
                    ({ roles, showCatalogEligibleOnly }) =>
                      (!showCatalogEligibleOnly || isCatalogueGeneral) && (!roles || hasOneOfRoles(auth, roles))
                  )
                  .map((fd, i) => {
                    return (
                      <Facet
                        key={i}
                        componentId={fd.componentId}
                        dataField={fd.dataField}
                        title={fd.title}
                        filterLabel={fd.filterLabel}
                        selectAllLabel={fd.selectAllLabel}
                        filters={FILTERS}
                        sortBy={fd.sortBy}
                      />
                    );
                  })}
              </div>
              <div className="search-results">
                {mode !== "simple" && (
                  <QueryBuilder
                    lang="fr"
                    collection={base}
                    react={{ and: FILTERS.filter((e) => e !== "QUERYBUILDER") }}
                    fields={queryBuilderField}
                  />
                )}
                <Box pt={2}>
                  <SelectedFilters showClearAll={false} innerClass={{ button: "selected-filters-button" }} />
                </Box>
                <div className={`result-view`}>
                  <ReactiveList
                    componentId="result"
                    title="Results"
                    dataField="_id"
                    loader="Chargement des résultats.."
                    size={8}
                    pagination={true}
                    showEndPage={false}
                    showResultStats={true}
                    sortBy="asc"
                    defaultQuery={() => {
                      return {
                        _source: columnsDefinition.map(({ accessor }) => accessor),
                      };
                    }}
                    renderItem={(data) =>
                      isBaseFormations ? (
                        <CardListFormation data={data} key={data._id} />
                      ) : (
                        <CardListEtablissements data={data} key={data._id} />
                      )
                    }
                    renderResultStats={(stats) => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {isBaseFormations
                              ? `${stats.numberOfResults.toLocaleString("fr-FR")} formations sur ${
                                  isCatalogueGeneral
                                    ? countCatalogueGeneral.toLocaleString("fr-FR")
                                    : countCatalogueNonEligible.toLocaleString("fr-FR")
                                } formations `
                              : `${stats.numberOfResults.toLocaleString(
                                  "fr-FR"
                                )} établissements affichées sur ${countEtablissement.toLocaleString(
                                  "fr-FR"
                                )} établissements`}
                          </span>
                          {auth?.sub !== "anonymous" && (
                            <ExportButton
                              index={base}
                              filters={FILTERS}
                              columns={columnsDefinition
                                .filter((def) => !def.debug)
                                .map((def) => ({
                                  header: def.Header,
                                  fieldName: def.accessor,
                                  formatter: def.formatter,
                                }))}
                              defaultQuery={{
                                match: {
                                  published: true,
                                },
                              }}
                            />
                          )}
                        </div>
                      );
                    }}
                    react={{ and: FILTERS }}
                  />
                </div>
              </div>
            </Flex>
          </Container>
        </div>
      </ReactiveBase>
    </Box>
  );
});
