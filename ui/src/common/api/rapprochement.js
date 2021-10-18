import { _get } from "../httpClient";

const endpointNewFront = `${process.env.REACT_APP_BASE_URL}/api`;

export const getResult = async ({ id }) => {
  const apiURL = `${endpointNewFront}/parcoursup/reconciliation/result`;
  return await _get(`${apiURL}/${id}`, false);
};
