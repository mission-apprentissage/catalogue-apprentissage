export const serialize = (obj) => {
  return JSON.stringify(obj, (key, value) => {
    if (key === "$regex") {
      return value.source;
    }
    return value;
  });
};

export const deserialize = (str) => {
  return JSON.parse(str, (key, value) => {
    if (key === "$regex") {
      return new RegExp(value);
    }
    return value;
  });
};

/**
 * Renvoie la date d'expiration autorisée pour validité d'enregistrement des codes cfd et rncp
 *
 * @param {Date} [currentDate]
 * @returns {Date}
 */
export const getExpirationDate = (currentDate = new Date()) => {
  let durationShift = 1;
  const now = currentDate;
  const sessionStart = new Date(`${currentDate.getFullYear()}-10-01T00:00:00.000Z`);
  if (now >= sessionStart) {
    durationShift = 0;
  }

  return new Date(`${currentDate.getFullYear() + 1 - durationShift}-08-31T23:59:59.999Z`);
};
