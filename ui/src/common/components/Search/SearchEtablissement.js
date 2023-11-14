import React, { useState } from "react";
import { DataSearch, ReactiveBase, ReactiveList, SelectedFilters } from "@appbaseio/reactivesearch";
import queryString from "query-string";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Box, Container, Flex, FormLabel, Switch, Text } from "@chakra-ui/react";

import useAuth from "../../hooks/useAuth";
import { hasAccessTo } from "../../utils/rolesUtils";
import { CardListEtablissement, ExportButton, Facet, HardFilters, QueryBuilder } from "./components";
import {
  allowedFilters,
  quickFiltersDefinition,
  queryBuilderField,
  dataSearch,
  columnsDefinition,
} from "./constantsEtablissements";
import { CloseCircleLine } from "../../../theme/components/icons";
import { SearchLine } from "../../../theme/components/icons/SearchLine";
import { Pagination } from "./components/Pagination";

import "./search.css";

export default React.memo(({ searchState, context, extraButtons = null }) => {
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState(searchParams.get("defaultMode") ?? "simple");
  const { base, countEtablissement, endpoint } = searchState;

  let [auth] = useAuth();
  const navigate = useNavigate();

  // const { allowedFilters, quickFiltersDefinition, queryBuilderField, dataSearch, columnsDefinition } =
  //   constantsEtablissements;

  const handleSearchSwitchChange = () => {
    setMode((prevValue) => {
      const newValue = prevValue === "simple" ? "advanced" : "simple";

      const s = new URLSearchParams(window.location.search);

      s.set("defaultMode", newValue);
      navigate(`?${s}`);

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
        <HardFilters allowedFilters={allowedFilters} context={context} />
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
                  react={{ and: allowedFilters.filter((e) => e !== `SEARCH`) }}
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
                  react={{ and: allowedFilters.filter((e) => e !== "QUERYBUILDER") }}
                  fields={queryBuilderField}
                />
              </Box>
            )}
            <Box borderTop="1px solid #E7E7E7" w="full" />
            <Flex className="search-row" flexDirection={["column", "column", "row"]}>
              <Box className="search-sidebar" px={[0, 0, 4]}>
                <Text fontWeight="700" color="grey.800" mt={4} mb={4} textStyle="rf-text">
                  FILTRER PAR
                </Text>
                {quickFiltersDefinition
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
                        filters={allowedFilters}
                        sortBy={fd.sortBy}
                        size={fd.size}
                        defaultQuery={() => {
                          return {
                            query: {
                              match: {
                                published: true,
                              },
                            },
                          };
                        }}
                        react={{ and: allowedFilters.filter((e) => e !== fd.componentId) }}
                        helpTextSection={fd.helpTextSection}
                        transformData={fd.transformData}
                        customQuery={fd.customQuery}
                        showSearch={fd.showSearch}
                      />
                    );
                  })}
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
                    renderItem={(data) => <CardListEtablissement data={data} key={data._id} />}
                    renderResultStats={(stats) => {
                      return (
                        <div className="summary-stats">
                          <span className="summary-text">
                            {`${stats.numberOfResults.toLocaleString(
                              "fr-FR"
                            )} organismes affichés sur ${countEtablissement.toLocaleString("fr-FR")} organismes`}
                          </span>

                          <ExportButton
                            index={base}
                            filters={allowedFilters}
                            columns={columnsDefinition
                              .filter((def) => def.exportable)
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
