const { partition, zip, size, chain } = require("lodash");

function distribute(arr1, arr2) {
  let ratio = Math.ceil(size(arr1) / size(arr2));
  let pattern = chain(new Array(ratio)).fill(arr2).flatten().take(size(arr1)).value();

  return zip(arr1, pattern);
}

module.exports = (array) => {
  if (size(array) <= 2) {
    return array;
  }

  let result = [];
  let [formateur, gestionnaire] = partition(array, (x) => x.type === "formateur");

  if (size(formateur) > size(gestionnaire)) {
    result.push(distribute(formateur, gestionnaire));
  } else {
    result.push(distribute(gestionnaire, formateur));
  }

  return result;
};
