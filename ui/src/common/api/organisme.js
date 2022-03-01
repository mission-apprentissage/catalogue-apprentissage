import { _get, _post, _put } from "../httpClient";
import { buildUpdatesHistory } from "../utils/historyUtils";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export const getOrganisme = async ({ id }) => {
  return await _get(`${endpointNewFront}/entity/etablissement/${id}`, false);
};

export const updateUaiOrganisme = async ({ id, etablissement, body, uai, user }) => {
  return await _put(`${endpointNewFront}/entity/etablissement/${id}`, {
    ...body,
    last_update_at: Date.now(),
    updates_history: buildUpdatesHistory(etablissement, { uai, last_update_who: user.email }, ["uai"]),
  });
};

export const etablissementService = async ({ body }) => {
  return await _post(`${endpointNewFront}/entity/etablissement/service`, body);
};
