const { showProgressBar } = require("../../src/common/utils/paginator");
const { Etablissement, Formation, User } = require("../../src/common/models");

const setupBeforeEach = () => {
  // console.debug(`${__filename} - beforeEach`);
};

const setupAfterEach = () => {
  // console.debug(`${__filename} - afterEach`);
};

const setupBeforeAll = () => {
  // console.debug(`${__filename} - before`);

  Formation.pauseMongoosasticHooks();
  Etablissement.pauseMongoosasticHooks();
  User.pauseMongoosasticHooks();

  showProgressBar(false);
};

const setupAfterAll = () => {
  // console.debug(`${__filename} - after`);

  Formation.startMongoosasticHooks();
  Etablissement.startMongoosasticHooks();
  User.startMongoosasticHooks();

  showProgressBar(true);
};

module.exports = {
  setupBeforeEach,
  setupAfterEach,
  setupBeforeAll,
  setupAfterAll,
};
