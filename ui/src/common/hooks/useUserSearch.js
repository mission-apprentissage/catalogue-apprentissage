import { useState, useEffect } from "react";
import { _get, _post } from "../httpClient";
import { mergedQueries, withUniqueKey, operators } from "../components/Search/components/QueryBuilder/utils";
import { USERS_ES_INDEX } from "../../constants/es";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

/**
 *
 * @returns {USERS_ES_INDEX}
 */
const getEsBase = () => {
  return USERS_ES_INDEX;
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
  return await _post("/api/es/search/users/_count", countEsQuery, options);
};

const getCountEntities = async (base, options) => {
  const params = new URLSearchParams({
    query: JSON.stringify({}),
  });
  const countUsers = await _get(`${CATALOGUE_API}/admin/users/count?${params}`, options);
  return {
    countUsers,
  };
};

/**
 *
 * @returns
 */
export const useUserSearch = () => {
  const base = getEsBase();

  const endpoint = CATALOGUE_API;
  const [iteration, setIteration] = useState(0);
  const [searchState, setSearchState] = useState({
    loaded: false,
    base,
    count: 0,
    iteration,
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
  }, [base, endpoint, iteration]);

  if (error !== null) {
    throw error;
  }

  const refreshSearchCount = () => {
    setIteration((i) => i + 1);
  };

  return [searchState, refreshSearchCount];
};
