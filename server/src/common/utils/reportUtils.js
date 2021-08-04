const { chunk } = require("lodash");
const { Report } = require("../model/index");
const { asyncForEach } = require("./asyncUtils");

/**
 * Store by chunks to stay below the Mongo document max size (16Mb)
 */
const storeByChunks = async (type, date, summary, key, values) => {
  const chunks = chunk(values, 500);
  await asyncForEach(chunks, async (chunk) => {
    await new Report({
      type,
      date,
      data: { summary, [key]: chunk },
    }).save();
  });
};

module.exports = { storeByChunks };
