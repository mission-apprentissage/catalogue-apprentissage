import { useState, useEffect } from "react";
import { _get } from "../httpClient";
import { mergedQueries, withUniqueKey } from "../components/Search/components/QueryBuilder/utils";
import { operators as frOperators } from "../components/Search/components/QueryBuilder/utils_fr";

const FORMATIONS_ES_INDEX = "convertedformation";
const ETABLISSEMENTS_ES_INDEX = "etablissements";
const RECONCILIATION_PS_ES_INDEX = "psformations2021";

const CATALOGUE_API_ENDPOINT = `${process.env.REACT_APP_BASE_URL}/api`;
const TCO_API_ENDPOINT =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

const getEsBase = (context) => {
  if (context === "organismes") {
    return ETABLISSEMENTS_ES_INDEX;
  }
  if (context === "reconciliation_ps") {
    return RECONCILIATION_PS_ES_INDEX;
  }
  return FORMATIONS_ES_INDEX;
};

const esQueryParser = () => {
  let s = new URLSearchParams(window.location.search);
  s = s.get("qb");
  if (!s) return null;

  const initialValue = JSON.parse(decodeURIComponent(s));
  const rules = withUniqueKey(initialValue);
  const queries = mergedQueries(
    rules.map((r) => ({ ...r, query: frOperators.find((o) => o.value === r.operator).query(r.field, r.value) }))
  );
  console.log(queries);
  return { query: { bool: queries } };
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

  if (base === RECONCILIATION_PS_ES_INDEX) {
    const countReconciliationPs = await _get(`${CATALOGUE_API_ENDPOINT}/parcoursup/reconciliation/count`, false);
    return {
      countReconciliationPs,
      countEtablissement: 0,
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
  const isBaseReconciliationPs = base === RECONCILIATION_PS_ES_INDEX;
  const endpoint = base === ETABLISSEMENTS_ES_INDEX ? TCO_API_ENDPOINT : CATALOGUE_API_ENDPOINT;
  const [searchState, setSearchState] = useState({
    loaded: false,
    base,
    count: 0,
    isBaseFormations,
    isBaseReconciliationPs,
    endpoint,
  });

  const [error, setError] = useState(null);
  useEffect(() => {
    const abortController = new AbortController();
    esQueryParser(); // TODO
    getCountEntities(base)
      .then((resultCount) => {
        if (!abortController.signal.aborted) {
          setSearchState({
            loaded: true,
            base,
            isBaseFormations,
            isBaseReconciliationPs,
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
  }, [base, endpoint, isBaseFormations, isBaseReconciliationPs]);

  if (error !== null) {
    throw error;
  }

  return searchState;
}
