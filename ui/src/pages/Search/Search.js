import React, { useState, useEffect, useCallback } from "react";
import { ReactiveBase, ReactiveList, DataSearch, SingleList, SelectedFilters } from "@appbaseio/reactivesearch";
import { Container, Flex, Spinner, Box } from "@chakra-ui/react";
import Switch from "react-switch";
import useAuth from "../../common/hooks/useAuth";
import Layout from "../layout/Layout";
import { hasOneOfRoles } from "../../common/utils/rolesUtils";

import {
  QueryBuilder,
  CardListFormation,
  CardListEtablissements,
  Facet,
  Pagination,
  ToggleCatalogue,
  ExportButton,
} from "./components";

import constantsFormations from "./constantsFormations";
import constantsRcoFormations from "./constantsRCOFormations";
import constantsEtablissements from "./constantsEtablissements";

import { _get } from "../../common/httpClient";

import "./search.css";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

const countItems = async (base, etablissement_reference_catalogue_published = true) => {
  let count;
  let params = new window.URLSearchParams({
    query: JSON.stringify({ published: true, etablissement_reference_catalogue_published }),
  });

  if (base === "mnaformation") {
    count = await _get(`${endpointNewFront}/entity/formations/count?${params}`, false);
  } else if (base === "convertedformations") {
    count = await _get(`${endpointNewFront}/entity/formations2021/count?${params}`, false);
  } else {
    params = new window.URLSearchParams({
      query: JSON.stringify({ published: true }),
    });
    count = await _get(`${endpointTCO}/entity/etablissements/count?${params}`, false);
  }

  return count;
};

const getBaseFromMatch = (match) => {
  let result;
  switch (match.path) {
    case "/recherche/formations-2020":
      result = "mnaformation";
      break;
    case "/recherche/etablissements":
      result = "etablissements";
      break;
    case "/recherche/formations-2021":
      result = "convertedformations";
      break;
    default:
      result = "mnaformation";
      break;
  }
  return result;
};

export default ({ match }) => {
  const [itemsCount, setItemsCount] = useState("");
  const [mode, setMode] = useState("simple");
  const matchBase = getBaseFromMatch(match);
  const [base, setBase] = useState(matchBase);
  const [isCatalogEligible, setCatalogueEligible] = useState(true);

  let [auth] = useAuth();

  const { FILTERS, facetDefinition, queryBuilderField, dataSearch, columnsDefinition } =
    base === "mnaformation"
      ? constantsFormations
      : base === "convertedformations"
      ? constantsRcoFormations
      : constantsEtablissements;

  const endPoint = ["mnaformation", "convertedformations"].includes(base) ? endpointNewFront : endpointTCO;

  useEffect(() => {
    async function run() {
      try {
        const newBase = getBaseFromMatch(match);
        setBase(newBase);

        let count = await countItems(newBase);

        if (newBase === "etablissements") {
          setItemsCount(`${count} établissements`);
        } else {
          setItemsCount(`${count} formations au Catalogue général`);
        }
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [match]);

  const handleSearchSwitchChange = () => {
    setMode(mode === "simple" ? "advanced" : "simple");
  };

  const resetCount = useCallback(
    async (val) => {
      try {
        let count = await countItems(base, val);
        if (base === "etablissements") {
          setItemsCount(`${count} établissements`);
        } else {
          setCatalogueEligible(!!val);
          setItemsCount(`${count} formations au ${val ? "Catalogue général" : "Catalogue non-éligible"}`);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [base]
  );

  return (
    <Layout>
      <div className="page search-page">
        {base !== matchBase && <Spinner />}

        {base === matchBase && (
          <ReactiveBase url={`${endPoint}/es/search`} app={base}>
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
                  <span>Recherche avancée</span>
                </label>
                <h1 className="title">
                  Votre recherche{" "}
                  {base === "mnaformation"
                    ? "de formations"
                    : base === "convertedformations"
                    ? "de formations 2021"
                    : "d'établissements"}
                </h1>
                <Flex className="search-row">
                  <div className={`search-sidebar`}>
                    {["mnaformation", "convertedformations"].includes(base) && (
                      <ToggleCatalogue filters={FILTERS} onChanged={resetCount} />
                    )}
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
                        showEndPage={true}
                        renderPagination={(paginationProp) => {
                          return <Pagination {...paginationProp} />;
                        }}
                        showResultStats={true}
                        sortBy="asc"
                        defaultQuery={() => {
                          return {
                            _source: columnsDefinition.map(({ accessor }) => accessor),
                          };
                        }}
                        renderItem={(data) =>
                          ["mnaformation", "convertedformations"].includes(base) ? (
                            <CardListFormation data={data} key={data._id} f2021={base === "convertedformations"} />
                          ) : (
                            <CardListEtablissements data={data} key={data._id} />
                          )
                        }
                        renderResultStats={(stats) => {
                          return (
                            <div className="summary-stats">
                              <span className="summary-text">
                                {["mnaformation", "convertedformations"].includes(base)
                                  ? `${stats.numberOfResults} formations affichées sur ${itemsCount}`
                                  : `${stats.numberOfResults} établissements affichées sur ${itemsCount}`}
                              </span>
                              {auth?.sub !== "anonymous" && (
                                <ExportButton
                                  index={base}
                                  filters={FILTERS}
                                  columns={columnsDefinition
                                    .filter((def) => !def.debug)
                                    .map((def) => ({ header: def.Header, fieldName: def.accessor }))}
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
        )}
      </div>
    </Layout>
  );
};
