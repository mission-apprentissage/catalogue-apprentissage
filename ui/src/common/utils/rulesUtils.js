import { PARCOURSUP_STATUS } from "../../constants/status";
import { CONDITIONS } from "../../constants/conditionsIntegration";

export const serialize = (obj) => {
  return JSON.stringify(obj, (key, value) => {
    if (key === "$regex") {
      return value.source;
    }
    return value;
  });
};

export const deserialize = (str) => {
  return JSON.parse(str, (key, value) => {
    if (key === "$regex") {
      return new RegExp(value);
    }
    return value;
  });
};

export const isStatusChangeEnabled = ({ plateforme, academie, num_academie, status, condition_integration }) => {
  if (plateforme === "parcoursup") {
    return academie
      ? (!num_academie || String(num_academie) === academie) &&
          status === PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR
      : true;
  }
  return academie
    ? (!num_academie || String(num_academie) === academie) && condition_integration === CONDITIONS.PEUT_INTEGRER
    : true;
};
