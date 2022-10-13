import { _get } from "../httpClient";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const getFormation = async ({ id }) => {
  return await _get(`${CATALOGUE_API}/entity/formation/${id}`, false);
};
