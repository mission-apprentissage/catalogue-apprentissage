const { showProgressBar } = require("../../src/common/utils/paginator");
// mock TCO
const rewiremock = require("rewiremock/node");
const { mock } = require("@mission-apprentissage/tco-service-node");
rewiremock("@mission-apprentissage/tco-service-node").with(mock);
const { ParcoursupFormation, Etablissement, Formation } = require("../../src/common/model");

const setupBeforeEach = () => {
  // console.debug(`${__filename} - beforeEach`);
  return rewiremock.enable();
};

const setupAfterEach = () => {
  // console.debug(`${__filename} - afterEach`);
  return rewiremock.disable();
};

const setupBefore = () => {
  // console.debug(`${__filename} - before`);

  console.log = () => {};

  ParcoursupFormation.pauseAllMongoosaticHooks();
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
