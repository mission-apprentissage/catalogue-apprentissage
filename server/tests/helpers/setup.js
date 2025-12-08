const { showProgressBar } = require("../../src/common/utils/paginator");
const { Etablissement, Formation } = require("../../src/common/models");

const setupBeforeEach = () => {
  // console.debug(`${__filename} - beforeEach`);
};

const setupAfterEach = () => {
  // console.debug(`${__filename} - afterEach`);
};

const setupBefore = () => {
  // console.debug(`${__filename} - before`);

  // console.log = () => {};

  Formation.pauseAllMongoosaticHooks();
  Etablissement.pauseAllMongoosaticHooks();

  showProgressBar(false);
};

const setupAfter = () => {
  // console.debug(`${__filename} - after`);

  showProgressBar(true);
};

module.exports = {
  setupBeforeEach,
  setupAfterEach,
  setupBefore,
  setupAfter,
};
