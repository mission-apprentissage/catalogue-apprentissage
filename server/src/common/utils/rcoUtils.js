/**
 * extract array of years from array of string dates
 */
const getPeriodeTags = (periode = []) => {
  return periode.reduce((acc, dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    if (!year || acc.includes(`${year}`) || year < 2020) {
      return acc;
    }
    return [...acc, `${year}`];
  }, []);
};

module.exports = { getPeriodeTags };
