/**
 * extract array of years from array of string dates
 */
const getPeriodeTags = (periode = []) => {
  const tags = periode.reduce((acc, dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    if (!year || acc.includes(year) || year < 2020) {
      return acc;
    }
    return [...acc, year];
  }, []);

  return tags.sort().map((year) => `${year}`);
};

module.exports = { getPeriodeTags };
