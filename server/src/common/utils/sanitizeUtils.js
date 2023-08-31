const mongoSanitize = require("express-mongo-sanitize");
const logger = require("../../common/logger");
const { isObject, transform } = require("lodash");

const SAFE_FIND_OPERATORS = [
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

const SAFE_UPDATE_OPERATORS = ["$push"];

const deepRenameKeys = (obj, keysMap) =>
  transform(obj, (result, value, key) => {
    result[keysMap[key] || key] = isObject(value) ? deepRenameKeys(value, keysMap) : value;
  });

const sanitize = (obj, SAFE_OPERATORS = []) => {
  let sanitizedObj = mongoSanitize.sanitize(obj, { replaceWith: "_", allowDots: true });

  const keysMap = SAFE_OPERATORS.reduce((acc, curr) => {
    acc[curr.replaceAll("$", "_")] = curr;
    return acc;
  }, {});
  sanitizedObj = deepRenameKeys(sanitizedObj, keysMap);

  logger.debug("", JSON.stringify(sanitizedObj));

  return sanitizedObj;
};

module.exports = { sanitize, SAFE_FIND_OPERATORS, SAFE_UPDATE_OPERATORS };
