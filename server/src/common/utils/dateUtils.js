/**
 * Retourne le premier jour du dernier mois correspondant au paramètre.
 *
 * @param {'01'|'02'|'03'|'04'|'05'|'06'|'07'|'08'|'09'|'10'|'11'|'12'} month
 * @returns {Date}
 */
const getLastMonth = (month) => {
  const today = new Date();

  if (+month < 1 || +month > 12) return undefined;
  const year = +month <= today.getMonth() + 1 ? today.getFullYear() : today.getFullYear() - 1;
  return new Date(`${year}-${month}-01`);
};

/**
 * Compare deux dates et vérifie qu'elles sont le même jour (indépendamment de l'heure)
 *
 * @param {Date} date1
 * @param {Date} date2
 * @return {boolean}
 */
const isSameDate = (date1, date2) => {
  if (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  ) {
    return true;
  }

  return false;
};

const isSunday = (date) => {
  if (!date) {
    date = new Date();
  }

  return date.getDay() === 6;
};

module.exports = { isSameDate, isSunday, getLastMonth };
