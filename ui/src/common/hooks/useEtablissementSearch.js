import { useState, useEffect } from "react";
import { _get, _post } from "../httpClient";
import { mergedQueries, withUniqueKey, operators } from "../components/Search/components/QueryBuilder/utils";
import { ETABLISSEMENTS_ES_INDEX } from "../../constants/es";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

/**
 *
 * @returns {ETABLISSEMENTS_ES_INDEX}
 */
const getEsBase = () => {
  return ETABLISSEMENTS_ES_INDEX;
};

const esQueryParser = async () => {
  let s = new URLSearchParams(/*window.location.search*/);
  s = s.get("qb");
  if (!s) return Promise.resolve(null);

  const initialValue = JSON.parse(decodeURIComponent(s));
  const rules = withUniqueKey(initialValue);
  return mergedQueries(
    rules.map((r) => ({ ...r, query: operators.find((o) => o.value === r.operator).query(r.field, r.value) }))
  );
};

const getEsCount = async (queries, options) => {
  const countEsQuery = {
    query: { bool: { ...queries, ...(queries?.should?.length > 0 ? { minimum_should_match: 1 } : {}) } },
  };
  return await _post("/api/es/search/etablissements/_count", countEsQuery, options);
};

const getCountEntities = async (options) => {
  const params = new URLSearchParams({
    query: JSON.stringify({ published: true }),
  });
  const countEtablissement = await _get(`${CATALOGUE_API}/entity/etablissements/count?${params}`, options);
  return {
    countEtablissement,
    countCatalogueGeneral: null,
    countCatalogueNonEligible: null,
  };
};

/**
 *
 * @returns
 */
export function useEtablissementSearch() {
  const base = getEsBase();

  const endpoint = CATALOGUE_API;
  const [searchState, setSearchState] = useState({
    loaded: false,
    base,
    count: 0,

    endpoint,
  });

  const [error, setError] = useState(null);
  useEffect(() => {
    const abortController = new AbortController();

    getCountEntities(base, { signal: abortController.signal })
      .then((resultCount) => {
        if (!abortController.signal.aborted) {
          setSearchState({
            loaded: true,
            base,

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
  }, [base, endpoint]);

  if (error !== null) {
    throw error;
  }

  return searchState;
}
