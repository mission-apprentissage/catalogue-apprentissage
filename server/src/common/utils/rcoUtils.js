/**
 * extract array of years from array of string dates
 */
const getPeriodeTags = (periode = []) => {
  const tags = extractPeriodeArray(periode).reduce((acc, dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    if (!year || acc.includes(year) || year < 2020) {
      return acc;
    }
    return [...acc, year];
  }, []);

  return tags.sort().map((year) => `${year}`);
};

const extractFirstValue = (value) => {
  return value?.split("##")[0] ?? null;
};

const extractPeriodeArray = (arr) => {
  return Array.from(new Set(arr.map((v) => v.split("##")).flat()));
};

module.exports = { getPeriodeTags, extractFirstValue, extractPeriodeArray };
