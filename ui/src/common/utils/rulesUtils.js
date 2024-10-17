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

// export const getCampagneStartDate = async () => {
//   const campagneStart = new Date(`${currentDate.getFullYear()}-10-15T00:00:00.000Z`);

//   return campagneStart.created_at;
// };

// /**
//  * Pour appliquer les étiquettes pour les plateformes PS & Affelnet
//  * une formation doit avoir au moins une date de début de formation >= début août de l'année scolaire suivante
//  * eg: si on est en janvier 2022 --> [01 août 2022] - 31 juillet 2023, si on est en octobre 2022 --> [01 août 2023] - 31 juillet 2024, etc.
//  * Si ce n'est pas le cas la formation sera "non publiable en l'état".
//  *
//  * @param {Date} [currentDate]
//  * @returns {Date}
//  */
// export const getSessionStartDate = async () => {
//   const sessionStart = await getCampagneStartDate();

//   const startDate = new Date(`${sessionStart.getFullYear() + 1}-08-01T00:00:00.000Z`);

//   return startDate;
// };

// /**
//  * Pour appliquer les étiquettes pour les plateformes PS & Affelnet
//  * une formation doit avoir au moins une date de début de formation < fin juillet de l'année scolaire suivante
//  * eg: si on est en janvier 2022 --> 01 août 2022 - [juillet 2023], si on est en octobre 2022 --> 01 août 2023 - [31 juillet 2024], etc.
//  * Si ce n'est pas le cas la formation sera "non publiable en l'état".
//  *
//  * @param {Date} [currentDate]
//  * @returns {Date}
//  */
// export const getSessionEndDate = async () => {
//   const sessionStart = await getCampagneStartDate();

//   const endDate = new Date(`${sessionStart.getFullYear() + 2}-07-31T23:59:59.999Z`);

//   return endDate;
// };

/**
 * Renvoi l'information permettant de savoir si la formation possède au moins une date de début sur la session en cours
 *
 * @param {Formation} formation
 * @param {Date} sessionStartDate
 * @param {Date} sessionEndDate
 * @returns {boolean}
 */
export const isInSession = ({ date_debut } = { date_debut: [] }, sessionStartDate, sessionEndDate) => {
  // const startDate = await getSessionStartDate();
  // const endDate = await getSessionEndDate();

  const datesInCampagne = date_debut?.filter(
    (date) =>
      new Date(date).getTime() >= sessionStartDate?.getTime() && new Date(date).getTime() <= sessionEndDate?.getTime()
  );

  const result = datesInCampagne?.length > 0;

  return result;
};

// /**
//  * Renvoi l'information permettant de savoir si la formation possède au moins une date de début sur la session en cours
//  *
//  * @param {Formation} formation
//  * @returns {boolean}
//  */
// export const isInPreviousSession = async ({ date_debut } = { date_debut: [] }) => {
//   const startDate = await getSessionStartDate();
//   const endDate = await getSessionEndDate();

//   startDate.setFullYear(startDate.getFullYear() - 1);
//   endDate.setFullYear(endDate.getFullYear() - 1);

//   const datesInCampagne = date_debut?.filter(
//     (date) => new Date(date).getTime() >= startDate.getTime() && new Date(date).getTime() <= endDate.getTime()
//   );
//   const result = datesInCampagne?.length > 0;

//   return result;
// };

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
