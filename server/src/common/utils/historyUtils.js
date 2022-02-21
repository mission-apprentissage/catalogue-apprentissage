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

module.exports = { findPublishedDate };
