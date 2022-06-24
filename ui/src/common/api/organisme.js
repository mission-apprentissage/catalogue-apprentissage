import { _get, _post, _put } from "../httpClient";
import { buildUpdatesHistory } from "../utils/historyUtils";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const getOrganisme = async ({ id }) => {
  return await _get(`${CATALOGUE_API}/entity/etablissement/${id}`, false);
};

export const updateUaiOrganisme = async ({ id, etablissement, body, uai, user }) => {
  return await _put(`${CATALOGUE_API}/entity/etablissement/${id}`, {
    ...body,
    last_update_at: Date.now(),
    updates_history: buildUpdatesHistory(etablissement, { uai, last_update_who: user.email }, ["uai"]),
  });
};

export const etablissementService = async ({ body }) => {
  return await _post(`${CATALOGUE_API}/entity/etablissement/service`, body);
};
