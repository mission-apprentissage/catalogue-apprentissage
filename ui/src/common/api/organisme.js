import { _get } from "../httpClient";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export const getOrganisme = async ({ id }) => {
  return await _get(`${endpointNewFront}/entity/etablissement/${id}`, false);
};
