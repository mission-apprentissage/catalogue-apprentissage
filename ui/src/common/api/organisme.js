import { _get } from "../httpClient";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const getOrganisme = async ({ id }) => {
  return await _get(`${CATALOGUE_API}/entity/etablissement/${id}`, false);
};
