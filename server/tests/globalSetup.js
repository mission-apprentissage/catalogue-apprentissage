const { showProgressBar } = require("../src/common/utils/paginator");

before(async () => {
  showProgressBar(false);
});

after(async () => {
  showProgressBar(true);
});
