import { _get } from "../httpClient";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

export const getResult = async ({ id }) => {
  const apiURL = `${CATALOGUE_API}/parcoursup/reconciliation/result`;
  return await _get(`${apiURL}/${id}`, false);
};
