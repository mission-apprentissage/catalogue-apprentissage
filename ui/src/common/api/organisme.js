import { _get } from "../httpClient";

const endpointTCO =
  process.env.REACT_APP_ENDPOINT_TCO || "https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1";

export const getOrganisme = async ({ id }) => {
  return await _get(`${endpointTCO}/entity/etablissement/${id}`, false);
};
