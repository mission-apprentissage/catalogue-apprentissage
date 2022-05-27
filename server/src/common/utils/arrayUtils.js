const diff = (arr1, arr2) => {
  return [...new Set(...arr1.filter((x) => !arr2.includes(x)), ...arr2.filter((x) => !arr1.includes(x)))];
};

module.exports = { diff };
