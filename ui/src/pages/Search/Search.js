import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, DataSearch } from "@appbaseio/reactivesearch";
import { Container, Row } from "reactstrap";
import Switch from "react-switch";
// import { API } from "aws-amplify";
// import { useSelector } from "react-redux";
import useAuth from "../../common/hooks/useAuth";
import Layout from "../layout/Layout";

// import config from "../../config";

import {
  QueryBuilder,
  CardListFormation,
  CardListEtablissements,
  Facet,
  Pagination,
  ToggleCatalogue,
  // ExportButton,
} from "./components";

import constantsFormations from "./constantsFormations";
import constantsRcoFormations from "./constantsRCOFormations";
import constantsEtablissements from "./constantsEtablissements";

import { _get } from "../../common/httpClient";

import "./search.css";

// import { getEnvName } from "../../config";
const ENV_NAME = "dev"; //getEnvName();
const endpointNewFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://catalogue-recette.apprentissage.beta.gouv.fr/api"
    : "https://catalogue.apprentissage.beta.gouv.fr/api";

const endpointOldFront =
  ENV_NAME === "local" || ENV_NAME === "dev"
    ? "https://r7mayzn08d.execute-api.eu-west-3.amazonaws.com/dev"
    : "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod";

export default ({ match }) => {
  const [countItems, setCountItems] = useState(0);
  const [mode, setMode] = useState("simple");
  const [base, setBase] = useState("mnaformation");
  const [endPoint, setEndpoint] = useState(endpointNewFront);

  const { FILTERS, columnsDefinition, facetDefinition, queryBuilderField, dataSearch } =
    base === "mnaformation"
      ? constantsFormations
      : base === "convertedformation"
      ? constantsRcoFormations
      : constantsEtablissements;

  // const { user } = useSelector((state) => state.user);
  let [auth] = useAuth();

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

        let countFormations = 0;

        const params = new window.URLSearchParams({
          query: JSON.stringify({ published: true }),
        });
        if (tmpBase === "mnaformation") {
          countFormations = await _get(`${endpointNewFront}/entity/formations/count?${params}`, false);
        } else if (tmpBase === "convertedformation") {
          countFormations = await _get(`${endpointNewFront}/entity/formations2021/count?${params}`, false);
        } else {
          const countEtablissement = await _get(`${endpointOldFront}/etablissements/count?${params}`, false);
          countFormations = countEtablissement.count;
        }

        setCountItems(countFormations);
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [match]);

  const handleSearchSwitchChange = () => {
    setMode(mode === "simple" ? "advanced" : "simple");
  };

  return (
    <Layout>
      <div className="page search-page">
        <ReactiveBase url={`${endPoint}/es/search`} app={base}>
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
                  {(base === "mnaformation" || base === "convertedformation") && <ToggleCatalogue filters={FILTERS} />}
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
                      defaultQuery={() => {
                        return {
                          //_source: exportTrainingColumns.map(def => def.accessor),
                          query: {
                            match: {
                              published: true,
                            },
                          },
                        };
                      }}
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
                                    countItems !== 0 ? countItems : ""
                                  } formations au total`
                                : `${stats.numberOfResults} établissements affichées sur ${
                                    countItems !== 0 ? countItems : ""
                                  } établissements`}
                            </span>
                            {/* {(base !== "convertedformation" || (user && base === "convertedformation")) && (
                            <ExportButton
                              index={base}
                              filters={FILTERS}
                              columns={columnsDefinition
                                .filter((def) => !def.debug || (user && def.exportOnly && def.debug))
                                .map((def) => ({ header: def.Header, fieldName: def.accessor }))}
                              defaultQuery={{
                                match: {
                                  published: true,
                                },
                              }}
                            />
                          )} */}
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
