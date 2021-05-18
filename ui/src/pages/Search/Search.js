import React, { useState, useEffect, useCallback } from "react";
import { Container, Spinner, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import useAuth from "../../common/hooks/useAuth";
import Layout from "../layout/Layout";
import constantsRcoFormations from "./constantsRCOFormations";
import constantsEtablissements from "./constantsEtablissements";
import { _get } from "../../common/httpClient";
import "./search.css";
import { NavLink } from "react-router-dom";
import { ArrowDropRightLine } from "../../theme/components/icons/";
import queryString from "query-string";
import ResultsEs from "./Results";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;
const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

const FORMATIONS_ES_INDEX = "convertedformation";

const countItems = async (base, etablissement_reference_catalogue_published = true) => {
  let count;
  let params = new window.URLSearchParams({
    query: JSON.stringify({ published: true, etablissement_reference_catalogue_published }),
  });

  if (base === FORMATIONS_ES_INDEX) {
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
    case "/recherche/etablissements":
      result = "etablissements";
      break;
    case "/recherche/formations-2021":
      result = FORMATIONS_ES_INDEX;
      break;
    default:
      result = FORMATIONS_ES_INDEX;
      break;
  }
  return result;
};

export default ({ match, location }) => {
  const [itemsCount, setItemsCount] = useState("");
  const { defaultMode } = queryString.parse(location.search);
  const [mode, setMode] = useState(defaultMode ?? "simple");
  const matchBase = getBaseFromMatch(match);
  const [base, setBase] = useState(matchBase);
  const [isCatalogEligible, setCatalogueEligible] = useState(true);

  let [auth] = useAuth();

  const isBaseFormations = base === FORMATIONS_ES_INDEX;

  const { FILTERS, facetDefinition, queryBuilderField, dataSearch, columnsDefinition } = isBaseFormations
    ? constantsRcoFormations
    : constantsEtablissements;

  const endPoint = isBaseFormations ? endpointNewFront : endpointTCO;

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
    setMode((prevValue) => (prevValue === "simple" ? "advanced" : "simple"));
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
      <Box w="100%" pt={[4, 8]} px={[1, 24]}>
        <Container maxW="xl">
          <Breadcrumb separator={<ArrowDropRightLine color="grey.600" />} textStyle="xs">
            <BreadcrumbItem>
              <BreadcrumbLink as={NavLink} to="/" color="grey.600" textDecoration="underline">
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>
                {isBaseFormations ? "Catalogue des formations en apprentissage 2021" : "Établissements"}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <div className="page search-page">
            {base !== matchBase && <Spinner />}
            {base === matchBase && <ResultsEs match={match} location={location} />}
          </div>
        </Container>
      </Box>
    </Layout>
  );
};
