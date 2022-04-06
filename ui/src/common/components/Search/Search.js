import React, { useState } from "react";
import { DataSearch, DatePicker, ReactiveBase, ReactiveList, SelectedFilters } from "@appbaseio/reactivesearch";
import { Box, Container, Flex, FormLabel, Switch, Text } from "@chakra-ui/react";
import useAuth from "../../hooks/useAuth";
import { hasAccessTo } from "../../utils/rolesUtils";
import {
  CardListEtablissements,
  CardListFormation,
  CardListPsFormations,
  ExportButton,
  Facet,
  HardFilters,
  QueryBuilder,
} from "./components";
import constantsFormations from "./constantsFormations";
import constantsEtablissements from "./constantsEtablissements";
import constantsReconciliationPS from "./constantsReconciliationPS";
import "./search.css";
import queryString from "query-string";
import { useHistory } from "react-router-dom";
import { CloseCircleLine } from "../../../theme/components/icons";
import { SearchLine } from "../../../theme/components/icons/SearchLine";
import InfoTooltip from "../../components/InfoTooltip";
import helpText from "../../../locales/helpText.json";
import { Pagination } from "./components/Pagination";
import { CONTEXT } from "../../../constants/context";

export default React.memo(({ location, searchState, context, onReconciliationCardClicked, extraButtons = null }) => {
  const { defaultMode } = queryString.parse(location.search);
  const [mode, setMode] = useState(defaultMode ?? "simple");
  const isCatalogueGeneral = context === CONTEXT.CATALOGUE_GENERAL;
  const {
    base,
    countEtablissement,
    countCatalogueGeneral,
    countCatalogueNonEligible,
    isBaseFormations,
    isBaseReconciliationPs,
    endpoint,
  } = searchState;

  let [auth] = useAuth();
  const history = useHistory();

  const { FILTERS, facetDefinition, queryBuilderField, dataSearch, columnsDefinition } = isBaseFormations
    ? constantsFormations
    : isBaseReconciliationPs
    ? constantsReconciliationPS
    : constantsEtablissements;

  const filters = FILTERS(context);

  const handleSearchSwitchChange = () => {
    setMode((prevValue) => {
      const newValue = prevValue === "simple" ? "advanced" : "simple";

      let s = new URLSearchParams(location.search);
      s.set("defaultMode", newValue);
      history.push(`?${s}`);

      return newValue;
    });
  };

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
        <HardFilters
          filters={filters}
          context={context}
          isBaseFormations={isBaseFormations}
          isBaseReconciliationPs={isBaseReconciliationPs}
        />
        <Box className="search" maxW="full">
          <Container maxW="xl" p={0}>
            {mode === "simple" && (
              <Box className={`search-container search-container-${mode}`}>
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
                  react={{ and: filters.filter((e) => e !== `SEARCH`) }}
                  showClear={true}
                  clearIcon={<CloseCircleLine boxSize={4} />}
                  icon={<SearchLine color={"bluefrance"} boxSize={5} />}
                  debounce={500}
                />
              </Box>
            )}
            <Box
              my={4}
              css={{
                "*, *:after, *:before": { boxSizing: "content-box !important" },
              }}
            >
              <Switch onChange={handleSearchSwitchChange} defaultIsChecked={mode !== "simple"} id={`search-mode`} />
              <FormLabel display="inline" htmlFor={`search-mode`} textStyle="sm" px={2}>
                Recherche avancée
              </FormLabel>
            </Box>
            {mode !== "simple" && (
              <Box mb={4}>
                <QueryBuilder
                  collection={base}
                  react={{ and: filters.filter((e) => e !== "QUERYBUILDER") }}
                  fields={queryBuilderField}
                />
              </Box>
            )}
            <Box borderTop="1px solid #E7E7E7" w="full" />
            <Flex className="search-row" flexDirection={["column", "column", "row"]}>
              <Box className="search-sidebar" px={[0, 0, 4]}>
                <Text fontWeight="700" color="grey.800" mt={4} mb={4} textStyle="rf-text">
                  FILTRER
                </Text>
                {facetDefinition(context)
                  .filter(
                    ({ acl, displayInContext, isAuth }) =>
                      (!displayInContext || displayInContext.includes(context)) &&
                      (!acl || hasAccessTo(auth, acl)) &&
                      (!isAuth || (isAuth && auth?.sub !== "anonymous"))
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
                        filters={filters}
                        sortBy={fd.sortBy}
                        size={fd.size}
                        defaultQuery={
                          !isBaseReconciliationPs
                            ? () => {
                                return {
                                  query: {
                                    match: {
                                      published: true,
                                    },
                                  },
                                };
                              }
                            : null
                        }
                        helpTextSection={fd.helpTextSection}
                        transformData={fd.transformData}
                        customQuery={fd.customQuery}
                        showSearch={fd.showSearch}
                      />
                    );
                  })}
                {isBaseFormations && auth?.sub !== "anonymous" && (
                  <Flex pt={3} direction="column">
                    <Box>
                      <Text mt={4} mb={4} textStyle="rf-text" width={"100%"}>
                        Début de formation <InfoTooltip description={helpText.search.periode.title} />
                      </Text>
                    </Box>

                    <Flex>
                      <Box w="50%">
                        <DatePicker
                          componentId="periode_start"
                          dataField="periode"
                          placeholder={"A partir de"}
                          numberOfMonths={1}
                          queryFormat="date"
                          showClear={false}
                          showFilter={true}
                          filterLabel="Début de formation après"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      periode: {
                                        gte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                      <Box w="50%">
                        <DatePicker
                          componentId="periode_end"
                          dataField="periode"
                          placeholder={"Jusqu'au"}
                          numberOfMonths={1}
                          queryFormat="date"
                          autoFocusEnd={true}
                          showClear={false}
                          showFilter={true}
                          filterLabel="Début de formation avant"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      periode: {
                                        lte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                )}
                {isBaseFormations && auth?.sub !== "anonymous" && (
                  <Flex pt={3} direction="column">
                    <Box>
                      <Text mt={4} mb={4} textStyle="rf-text" width={"100%"}>
                        Date de publication sur Parcoursup
                      </Text>
                    </Box>

                    <Flex>
                      <Box w="50%">
                        <DatePicker
                          componentId="parcoursup_published_date_start"
                          dataField="parcoursup_published_date"
                          placeholder={"A partir de"}
                          numberOfMonths={1}
                          queryFormat="date"
                          showClear={false}
                          showFilter={true}
                          filterLabel="Publication Parcoursup après"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      parcoursup_published_date: {
                                        gte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                      <Box w="50%">
                        <DatePicker
                          componentId="parcoursup_published_date_end"
                          dataField="parcoursup_published_date"
                          placeholder={"Jusqu'au"}
                          numberOfMonths={1}
                          queryFormat="date"
                          showClear={false}
                          showFilter={true}
                          filterLabel="Publication Parcoursup avant"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      parcoursup_published_date: {
                                        lte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                )}
                {isBaseFormations && auth?.sub !== "anonymous" && (
                  <Flex pt={3} direction="column">
                    <Box>
                      <Text mt={4} mb={4} textStyle="rf-text" width={"100%"}>
                        Date de publication sur Affelnet
                      </Text>
                    </Box>

                    <Flex>
                      <Box w="50%">
                        <DatePicker
                          componentId="affelnet_published_date_start"
                          dataField="affelnet_published_date"
                          placeholder={"A partir de"}
                          numberOfMonths={1}
                          queryFormat="date"
                          showClear={false}
                          showFilter={true}
                          filterLabel="Publication Affelnet après"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      affelnet_published_date: {
                                        gte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                      <Box w="50%">
                        <DatePicker
                          componentId="affelnet_published_date_end"
                          dataField="affelnet_published_date"
                          placeholder={"Jusqu'au"}
                          numberOfMonths={1}
                          queryFormat="date"
                          showClear={false}
                          showFilter={true}
                          filterLabel="Publication Affelnet avant"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      affelnet_published_date: {
                                        lte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                )}
                {isBaseFormations && auth?.sub !== "anonymous" && (
                  <Flex pt={3} direction="column">
                    <Box>
                      <Text mt={4} mb={4} textStyle="rf-text" width={"100%"}>
                        Dernière mise à jour du statut
                      </Text>
                    </Box>

                    <Flex>
                      <Box w="50%">
                        <DatePicker
                          componentId="last_statut_update_date_start"
                          dataField="last_statut_update_date"
                          placeholder={"A partir de"}
                          numberOfMonths={1}
                          queryFormat="date"
                          showClear={false}
                          showFilter={true}
                          filterLabel="Statut modifié après"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      last_statut_update_date: {
                                        gte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                      <Box w="50%">
                        <DatePicker
                          componentId="last_statut_update_date_end"
                          dataField="last_statut_update_date"
                          placeholder={"Jusqu'au"}
                          numberOfMonths={1}
                          queryFormat="date"
                          showClear={false}
                          showFilter={true}
                          filterLabel="Statut modifié avant"
                          URLParams={true}
                          customQuery={(value) => {
                            return value
                              ? {
                                  query: {
                                    range: {
                                      last_statut_update_date: {
                                        lte: value,
                                      },
                                    },
                                  },
                                }
                              : {};
                          }}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                )}
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
                    innerClass={{ pagination: "search-pagination" }}
                    pagination={true}
                    URLParams={true}
                    showResultStats={true}
                    sortBy="asc"
                    defaultQuery={() => {
                      return {
                        _source: columnsDefinition.map(({ accessor }) => accessor),
                      };
                    }}
                    renderItem={(data) =>
                      isBaseFormations ? (
                        <CardListFormation data={data} key={data._id} context={context} />
                      ) : isBaseReconciliationPs ? (
                        <CardListPsFormations
                          data={data}
                          key={data._id}
                          onCardClicked={() => {
                            onReconciliationCardClicked(data);
                          }}
                          context={context}
                        />
                      ) : (
                        <CardListEtablissements data={data} key={data._id} />
                      )
                    }
                    renderResultStats={(stats) => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {isBaseFormations &&
                              isCatalogueGeneral &&
                              `${stats.numberOfResults.toLocaleString(
                                "fr-FR"
                              )} formations sur ${countCatalogueGeneral.total.toLocaleString("fr-FR")}`}
                            {isBaseFormations &&
                              !isCatalogueGeneral &&
                              `${stats.numberOfResults.toLocaleString(
                                "fr-FR"
                              )} formations sur ${countCatalogueNonEligible.total.toLocaleString("fr-FR")}`}
                            {!isBaseFormations &&
                              `${
                                isBaseReconciliationPs
                                  ? `${stats.numberOfResults.toLocaleString("fr-FR")} rapprochements ${context.replace(
                                      "reconciliation_ps_",
                                      ""
                                    )}`
                                  : `${stats.numberOfResults.toLocaleString(
                                      "fr-FR"
                                    )} organismes affichés sur ${countEtablissement.toLocaleString("fr-FR")} organismes`
                              }`}
                          </span>
                          {(hasAccessTo(auth, "page_catalogue/export_btn") ||
                            hasAccessTo(auth, "page_organismes/export_btn")) && (
                            <ExportButton
                              index={base}
                              filters={filters}
                              columns={columnsDefinition
                                .filter((def) => def.exportable)
                                .map((def) => ({
                                  header: def.Header,
                                  fieldName: def.accessor,
                                  formatter: def.formatter,
                                }))}
                              context={context}
                            />
                          )}
                          {extraButtons}
                        </div>
                      );
                    }}
                    react={{ and: filters }}
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
