import { useState, useEffect } from "react";
import { _get } from "../httpClient";

const FORMATIONS_ES_INDEX = "convertedformation";
const ETABLISSEMENTS_ES_INDEX = "etablissements";

const CATALOGUE_API_ENDPOINT = `${process.env.REACT_APP_BASE_URL}/api`;
const TCO_API_ENDPOINT =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

const getEsBase = (context) => {
  if (context === "organismes") {
    return ETABLISSEMENTS_ES_INDEX;
  }
  return FORMATIONS_ES_INDEX;
};

const getCountEntities = async (base) => {
  if (base === ETABLISSEMENTS_ES_INDEX) {
    const params = new window.URLSearchParams({
      query: JSON.stringify({ published: true }),
    });
    const countEtablissement = await _get(`${TCO_API_ENDPOINT}/entity/etablissements/count?${params}`, false);
    return {
      countEtablissement,
      countCatalogueGeneral: 0,
      countCatalogueNonEligible: 0,
    };
  }

  const paramsG = new window.URLSearchParams({
    query: JSON.stringify({ published: true, etablissement_reference_catalogue_published: true }),
  });
  const countCatalogueGeneral = await _get(`${CATALOGUE_API_ENDPOINT}/entity/formations2021/count?${paramsG}`, false);
  const paramsNE = new window.URLSearchParams({
    query: JSON.stringify({ published: true, etablissement_reference_catalogue_published: false }),
  });
  const countCatalogueNonEligible = await _get(
    `${CATALOGUE_API_ENDPOINT}/entity/formations2021/count?${paramsNE}`,
    false
  );
  return {
    countEtablissement: 0,
    countCatalogueGeneral,
    countCatalogueNonEligible,
  };
};

// context: organismes |  catalogue
export function useSearch(context) {
  const base = getEsBase(context);
  const isBaseFormations = base === FORMATIONS_ES_INDEX;
  const endpoint = isBaseFormations ? CATALOGUE_API_ENDPOINT : TCO_API_ENDPOINT;
  const [searchState, setSearchState] = useState({
    loaded: false,
    base,
    count: 0,
    isBaseFormations,
    endpoint,
  });

  const [error, setError] = useState(null);
  useEffect(() => {
    const abortController = new AbortController();
    getCountEntities(base)
      .then((resultCount) => {
        if (!abortController.signal.aborted) {
          setSearchState({
            loaded: true,
            base,
            isBaseFormations,
            endpoint,
            ...resultCount,
          });
        }
      })
      .catch((e) => {
        if (!abortController.signal.aborted) {
          setError(e);
        }
      });
    return () => {
      abortController.abort();
    };
  }, [base, endpoint, isBaseFormations]);

  if (error !== null) {
    throw error;
  }

  return searchState;
}
