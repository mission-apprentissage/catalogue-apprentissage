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

  Formation.pauseAllMongoosaticHooks();
  Etablissement.pauseAllMongoosaticHooks();
  User.pauseAllMongoosaticHooks();

  showProgressBar(false);
};

const setupAfterAll = () => {
  // console.debug(`${__filename} - after`);

  Formation.startAllMongoosaticHooks();
  Etablissement.startAllMongoosaticHooks();
  User.startAllMongoosaticHooks();

  showProgressBar(true);
};

module.exports = {
  setupBeforeEach,
  setupAfterEach,
  setupBeforeAll,
  setupAfterAll,
};
