const { showProgressBar } = require("../src/common/utils/paginator");
// mock TCO
const rewiremock = require("rewiremock/node");
const { mock } = require("@mission-apprentissage/tco-service-node");
const { PsFormation, Etablissement, Formation } = require("../src/common/model");
rewiremock("@mission-apprentissage/tco-service-node").with(mock);

beforeEach(() => rewiremock.enable());
afterEach(() => rewiremock.disable());

before(async () => {
  // mute console logs
  console.log = () => {};

  showProgressBar(false);

  PsFormation.pauseAllMongoosaticHooks();
  Formation.pauseAllMongoosaticHooks();
  Etablissement.pauseAllMongoosaticHooks();
});

after(async () => {
  showProgressBar(true);
});
