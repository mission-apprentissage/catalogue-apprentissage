const { showProgressBar } = require("../src/common/utils/paginator");
// mock TCO
const rewiremock = require("rewiremock/node");
const { mock } = require("@mission-apprentissage/tco-service-node");
rewiremock("@mission-apprentissage/tco-service-node").with(mock);
const { ParcoursupFormation, Etablissement, Formation } = require("../src/common/model");

beforeEach(() => rewiremock.enable());
afterEach(() => rewiremock.disable());

before(async () => {
  // mute console logs
  // console.log = () => {};

  showProgressBar(false);

  ParcoursupFormation.pauseAllMongoosaticHooks();
  Formation.pauseAllMongoosaticHooks();
  Etablissement.pauseAllMongoosaticHooks();
});

after(async () => {
  showProgressBar(true);
});
