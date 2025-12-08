const { chunk } = require("lodash");

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const chunkedAsyncForEach = async (array, callback, chunkSize = 10) => {
  const chunks = chunk(array, chunkSize);
  await asyncForEach(chunks, async (chunk) => {
    await Promise.all(
      chunk.map(async (item) => {
        await callback(item);
      })
    );
  });
};

const timeout = (promise, millis) => {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => reject(`Timed out after ${millis} ms.`), millis);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeout));
};

const delay = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

module.exports = { asyncForEach, chunkedAsyncForEach, delay, timeout };
