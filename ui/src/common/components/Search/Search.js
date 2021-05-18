import React, { useState, useCallback } from "react";
import { ReactiveBase, ReactiveList, DataSearch, SingleList, SelectedFilters } from "@appbaseio/reactivesearch";
import { Container, Flex, Box, Heading, Text, Spinner } from "@chakra-ui/react";
import Switch from "react-switch";
import useAuth from "../../hooks/useAuth";
import { hasOneOfRoles } from "../../utils/rolesUtils";
import {
  QueryBuilder,
  CardListFormation,
  CardListEtablissements,
  Facet,
  ToggleCatalogue,
  ExportButton,
} from "./components";
import constantsRcoFormations from "./constantsRCOFormations";
import constantsEtablissements from "./constantsEtablissements";
import "./search.css";
import queryString from "query-string";
import { useSearch } from "../../hooks/useSearch";

export default ({ match, location, context }) => {
  const { defaultMode } = queryString.parse(location.search);
  const [mode, setMode] = useState(defaultMode ?? "simple");
  const [isCatalogEligible, setCatalogueEligible] = useState(true);

  const { loaded, base, count, isBaseFormations, endpoint } = useSearch({ context });
  console.log({ loaded, base, count, isBaseFormations, endpoint });

  let [auth] = useAuth();

  const { FILTERS, facetDefinition, queryBuilderField, dataSearch, columnsDefinition } = isBaseFormations
    ? constantsRcoFormations
    : constantsEtablissements;

  const handleSearchSwitchChange = () => {
    setMode((prevValue) => (prevValue === "simple" ? "advanced" : "simple"));
  };

  const resetCount = useCallback(
    async (val) => {
      try {
        // let count = await countItems(base, val);
        if (base === "etablissements") {
          // setItemsCount(`${count} établissements`);
        } else {
          setCatalogueEligible(!!val);
          // setItemsCount(`${count} formations au ${val ? "Catalogue général" : "Catalogue non-éligible"}`);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [base]
  );

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
        <SingleList
          componentId="published"
          dataField="published"
          react={{ and: FILTERS }}
          value={"true"}
          defaultValue={"true"}
          showFilter={false}
          showSearch={false}
          showCount={false}
          render={() => {
            return <div />;
          }}
        />
        <div className="search">
          <Container maxW="full">
            <label className="react-switch" style={{ right: "70px" }}>
              <Switch onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
              <Text as="span" textStyle="sm">
                Recherche avancée
              </Text>
            </label>
            <Heading as="h1" fontSize="beta" className="title">
              {isBaseFormations
                ? "Catalogue des formations en apprentissage 2021"
                : "Liste des établissements de formation"}
            </Heading>
            <Flex className="search-row" flexDirection={["column", "row"]}>
              <div className={`search-sidebar`}>
                {isBaseFormations && <ToggleCatalogue filters={FILTERS} onChanged={resetCount} />}
                {facetDefinition
                  .filter(
                    ({ roles, showCatalogEligibleOnly }) =>
                      (!showCatalogEligibleOnly || isCatalogEligible) && (!roles || hasOneOfRoles(auth, roles))
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
                            {/* {isBaseFormations
                              ? `${stats.numberOfResults.toLocaleString("fr-FR")} formations`
                              : `${stats.numberOfResults} établissements affichées sur ${itemsCount}`} */}
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
};
