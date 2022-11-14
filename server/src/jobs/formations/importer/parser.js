// @ts-check
const { DateTime } = require("luxon");

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */

/**
 *  @type {{ [key in keyof Formation]: "boolean"|"date"|"periode"|"niveau"|"nullable"|"nullable-boolean"|"number"|"array"|"rncp_details" }}
 */
const TYPES_MAP = {
  cfd_date_fermeture: "date",
};

// Some fields need to be parsed to be cast to the right type
const parser = (obj, typesMap = TYPES_MAP) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      let parsedValue;

      const type = typesMap[key];
      switch (type) {
        case "date":
          parsedValue = value ? DateTime.fromFormat(value, "yyyy-MM-dd", { zone: "Europe/Paris" }).toJSDate() : null;
          break;

        default:
          parsedValue = value;
          break;
      }

      return [key, parsedValue];
    })
  );
};

module.exports = { parser };
