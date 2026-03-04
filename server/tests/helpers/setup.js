const { showProgressBar } = require("../../src/common/utils/paginator");
const { Etablissement, Formation, User } = require("../../src/common/models");

Formation.pauseMongoosasticHooks();
Etablissement.pauseMongoosasticHooks();
User.pauseMongoosasticHooks();

const setupBeforeEach = () => {
  // console.debug(`${__filename} - beforeEach`);
};

const setupAfterEach = () => {
  // console.debug(`${__filename} - afterEach`);
};

const setupBeforeAll = () => {
  // console.debug(`${__filename} - before`);

  showProgressBar(false);
};

const setupAfterAll = () => {
  // console.debug(`${__filename} - after`);

  showProgressBar(true);
};

module.exports = {
  setupBeforeEach,
  setupAfterEach,
  setupBeforeAll,
  setupAfterAll,
};
