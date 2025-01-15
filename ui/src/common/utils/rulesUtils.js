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

  // console.log({ plateforme, academie, num_academie, status, condition_integration });
  return academie
    ? /*(!num_academie || String(num_academie) === academie) && */ condition_integration === CONDITIONS.PEUT_INTEGRER
    : true;
};

/**
 * Renvoi l'information permettant de savoir si la formation possède au moins une date de début sur la session en cours
 *
 * @param {Formation} formation
 * @param {Date} sessionStartDate
 * @param {Date} sessionEndDate
 * @returns {boolean}
 */
export const isInSession = ({ date_debut } = { date_debut: [] }, sessionStartDate, sessionEndDate) => {
  const datesInCampagne = date_debut?.filter(
    (date) =>
      new Date(date).getTime() >= sessionStartDate?.getTime() && new Date(date).getTime() <= sessionEndDate?.getTime()
  );

  const result = datesInCampagne?.length > 0;

  return result;
};

/**
 * Renvoie la date d'expiration autorisée pour validité d'enregistrement des codes cfd et rncp
 *
 * @param {Date} [currentDate]
 * @returns {Date}
 */
export const getExpirationDate = (currentDate = new Date()) => {
  let durationShift = 1;
  const now = currentDate;
  const sessionStart = new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`);
  if (now >= sessionStart) {
    durationShift = 0;
  }

  return new Date(`${currentDate.getFullYear() + 1 - durationShift}-08-31T23:59:59.999Z`);
};
