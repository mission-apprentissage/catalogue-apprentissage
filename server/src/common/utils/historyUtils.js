const { COMMON_STATUS } = require("../../constants/status");

/**
 * find last not "publié" from the end and return "publié" date
 */
const findPublishedDate = (formation, plateforme) => {
  // ensure formation is currently published first
  if (formation[`${plateforme}_statut`] !== COMMON_STATUS.PUBLIE) {
    return null;
  }

  const lastIndex = formation[`${plateforme}_statut_history`].length - 1;
  let publishedDate = formation[`${plateforme}_statut_history`][lastIndex].date;
  for (let i = lastIndex; i >= 0; i--) {
    const historyElement = formation[`${plateforme}_statut_history`][i];

    if (historyElement[`${plateforme}_statut`] === COMMON_STATUS.PUBLIE) {
      publishedDate = historyElement.date;
    } else {
      return publishedDate;
    }
  }
  return publishedDate;
};

/**
 * find last statut (affelnet or parcoursup) update
 */
const findLastStatutUpdateDateForPlatform = (formation, plateforme) => {
  // ensure formation is currently published first
  if (!formation[`${plateforme}_statut_history`].length) {
    return null;
  }

  const lastIndex = formation[`${plateforme}_statut_history`].length - 1;
  const lastStatut = formation[`${plateforme}_statut_history`][lastIndex][`${plateforme}_statut`];
  let lastStatutUdpateDate = formation[`${plateforme}_statut_history`][lastIndex].date;
  for (let i = lastIndex; i >= 0; i--) {
    const historyElement = formation[`${plateforme}_statut_history`][i];

    if (historyElement[`${plateforme}_statut`] === lastStatut) {
      lastStatutUdpateDate = historyElement.date;
    } else {
      return lastStatutUdpateDate;
    }
  }
  return lastStatutUdpateDate;
};

/**
 * find last statut (affelnet or parcoursup) update
 */
const findLastStatutUpdateDate = (formation) => {
  const affelnetDate = findLastStatutUpdateDateForPlatform(formation, "affelnet");
  const parcoursupDate = findLastStatutUpdateDateForPlatform(formation, "parcoursup");

  return affelnetDate > parcoursupDate ? affelnetDate : parcoursupDate;
};

module.exports = { findPublishedDate, findLastStatutUpdateDate, findLastStatutUpdateDateForPlatform };
