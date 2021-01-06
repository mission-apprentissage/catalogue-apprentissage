import React, { useState, useEffect, useCallback } from "react";
import { ReactiveBase, ReactiveList, DataSearch, SingleList } from "@appbaseio/reactivesearch";
import { Container, Row } from "reactstrap";
import Switch from "react-switch";
import useAuth from "../../common/hooks/useAuth";
import Layout from "../layout/Layout";

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
const endpointOldFront =
  process.env.REACT_APP_ENDPOINT_OLD_FRONT || "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

const countItems = async (base, etablissement_reference_catalogue_published = true) => {
  let count = 0;

  let params = new window.URLSearchParams({
    query: JSON.stringify({ published: true, etablissement_reference_catalogue_published }),
  });
  if (base === "mnaformation") {
    count = await _get(`${endpointNewFront}/entity/formations/count?${params}`, false);
  } else if (base === "convertedformation") {
    count = await _get(`${endpointNewFront}/entity/formations2021/count?${params}`, false);
  } else {
    params = new window.URLSearchParams({
      query: JSON.stringify({ published: true }),
    });
    const countEtablissement = await _get(`${endpointOldFront}/etablissements/count?${params}`, false);
    count = countEtablissement.count;
  }

  return count;
};

export default ({ match }) => {
  const [itemsCount, setItemsCount] = useState(0);
  const [mode, setMode] = useState("simple");
  const [base, setBase] = useState("mnaformation");
  const [endPoint, setEndpoint] = useState(endpointNewFront);
  let [auth] = useAuth();

  const { FILTERS, facetDefinition, queryBuilderField, dataSearch, columnsDefinition } =
    base === "mnaformation"
      ? constantsFormations
      : base === "convertedformation"
      ? constantsRcoFormations
      : constantsEtablissements;

  useEffect(() => {
    async function run() {
      try {
        let tmpBase = "mnaformation";
        switch (match.path) {
          case "/recherche/formations-2020":
            tmpBase = "mnaformation";
            break;
          case "/recherche/etablissements":
            tmpBase = "etablissements";
            break;
          case "/recherche/formations-2021":
            tmpBase = "convertedformation";
            break;
          default:
            tmpBase = "mnaformation";
            break;
        }

        setEndpoint(
          tmpBase === "mnaformation" || tmpBase === "convertedformation" ? endpointNewFront : endpointOldFront
        );
        setBase(tmpBase);

        let countFormations = await countItems(tmpBase);

        setItemsCount(countFormations);
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
        let countFormations = await countItems(base, val);
        setItemsCount(countFormations);
      } catch (error) {
        console.log(error);
      }
    },
    [base]
  );

  return (
    <Layout>
      <div className="page search-page">
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
            <Container fluid style={{ maxWidth: 1860 }}>
              <label className="react-switch" style={{ right: "70px" }}>
                <Switch onChange={handleSearchSwitchChange} checked={mode !== "simple"} />
                <span>Recherche avancée</span>
              </label>
              <h1 className="title">
                Votre recherche{" "}
                {base === "mnaformation"
                  ? "de formations"
                  : base === "convertedformation"
                  ? "de formations 2021"
                  : "d'établissements"}
              </h1>
              <Row className="search-row">
                <div className={`search-sidebar`}>
                  {facetDefinition.map((fd, i) => {
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
                  {(base === "mnaformation" || base === "convertedformation") && (
                    <ToggleCatalogue filters={FILTERS} onChanged={resetCount} />
                  )}
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
                      />
                    </div>
                  )}
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
                      // defaultQuery={() => { // TODO to un-comment to reduce payload size
                      //   return {
                      //     //_source: columnsDefinition.map((def) => def.accessor),
                      //   };
                      // }}
                      renderItem={(data) =>
                        base === "mnaformation" || base === "convertedformation" ? (
                          <CardListFormation data={data} key={data._id} f2021={base === "convertedformation"} />
                        ) : (
                          <CardListEtablissements data={data} key={data._id} />
                        )
                      }
                      renderResultStats={(stats) => {
                        return (
                          <div className="summary-stats">
                            <span className="summary-text">
                              {base === "mnaformation" || base === "convertedformation"
                                ? `${stats.numberOfResults} formations affichées sur ${
                                    itemsCount !== 0 ? itemsCount : ""
                                  } formations au total`
                                : `${stats.numberOfResults} établissements affichées sur ${
                                    itemsCount !== 0 ? itemsCount : ""
                                  } établissements`}
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
              </Row>
            </Container>
          </div>
        </ReactiveBase>
      </div>
    </Layout>
  );
};
