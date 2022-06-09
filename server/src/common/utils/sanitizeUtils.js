const mongoSanitize = require("express-mongo-sanitize");
const { isObject, transform } = require("lodash");

const SAFE_OPERATORS = [
  "$eq",
  "$in",
  "$ne",
  "$nin",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$or",
  "$and",
  "$not",
  "$nor",
  "$elemMatch",
  "$all",
  "$size",
  "$regex",
  "$options",
  "$exists",
];

const deepRenameKeys = (obj, keysMap) =>
  transform(obj, (result, value, key) => {
    result[keysMap[key] || key] = isObject(value) ? deepRenameKeys(value, keysMap) : value;
  });

const sanitize = (obj, { allowSafeOperators } = { allowSafeOperators: false }) => {
  let sanitizedObj = mongoSanitize.sanitize(obj, { replaceWith: "_" });

  if (allowSafeOperators) {
    const keysMap = SAFE_OPERATORS.reduce((acc, curr) => {
      acc[curr.replaceAll("$", "_")] = curr;
      return acc;
    }, {});
    sanitizedObj = deepRenameKeys(sanitizedObj, keysMap);
  }

  return sanitizedObj;
};

module.exports = { sanitize };
