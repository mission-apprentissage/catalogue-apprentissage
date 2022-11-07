import { _get } from "../httpClient";

export const getFormation = async ({ id }) => {
  return await _get(`/api/v1/entity/formation/${id}`, false);
};
