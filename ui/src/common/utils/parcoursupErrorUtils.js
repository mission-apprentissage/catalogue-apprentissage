import { parcoursupErrors } from "../../constants/parcoursupErrors";

export const getParcoursupError = (formation) => {
  const descriptor = parcoursupErrors.find((error) => formation.parcoursup_error.match(error.regexp));

  return descriptor;
};

export const getParcoursupErrorDescription = (formation) => {
  return getParcoursupError(formation)?.description;
};

export const getParcoursupErrorAction = (formation) => {
  return getParcoursupError(formation)?.action;
};
