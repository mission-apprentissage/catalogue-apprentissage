import { useState, useEffect } from "react";
import { _get } from "../httpClient";

const FORMATIONS_ES_INDEX = "convertedformation";
const ETABLISSEMENTS_ES_INDEX = "etablissements";

const CATALOGUE_API_ENDPOINT =
  process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue-recette.apprentissage.beta.gouv.fr/api";
const TCO_API_ENDPOINT =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api";

const getEsBase = (context) => {
  if (context === "organismes") {
    return ETABLISSEMENTS_ES_INDEX;
  }
  return FORMATIONS_ES_INDEX;
};

const getCountEntities = async (base, etablissement_reference_catalogue_published = true) => {
  if (base === ETABLISSEMENTS_ES_INDEX) {
    const params = new window.URLSearchParams({
      query: JSON.stringify({ published: true }),
    });
    return await _get(`${TCO_API_ENDPOINT}/entity/etablissements/count?${params}`, false);
  }

  const params = new window.URLSearchParams({
    query: JSON.stringify({ published: true, etablissement_reference_catalogue_published }),
  });
  return await _get(`${CATALOGUE_API_ENDPOINT}/entity/formations2021/count?${params}`, false);
};

// context: organismes | catalogue_general | catalogue_non_eligible
export function useSearch({ context }) {
  const base = getEsBase(context);
  const isBaseFormations = base === FORMATIONS_ES_INDEX;
  const endpoint = isBaseFormations ? CATALOGUE_API_ENDPOINT : TCO_API_ENDPOINT;
  const isCatalogueGeneral = context === "catalogue_general";
  const [searchState, setSearchState] = useState({
    loaded: false,
    base,
    count: 0,
    isBaseFormations,
    endpoint,
    isCatalogueGeneral,
  });

  const [error, setError] = useState(null);
  useEffect(() => {
    const abortController = new AbortController();
    getCountEntities(base)
      .then((countEntities) => {
        if (!abortController.signal.aborted) {
          setSearchState({
            loaded: true,
            base,
            count: countEntities,
            isBaseFormations,
            endpoint,
            isCatalogueGeneral,
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
  }, [base, endpoint, isBaseFormations, isCatalogueGeneral]);

  if (error !== null) {
    throw error;
  }

  return searchState;
}
