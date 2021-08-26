const { showProgressBar } = require("../src/common/utils/paginator");

before(async () => {
  // mute console logs
  console.log = () => {};

  showProgressBar(false);
});

after(async () => {
  showProgressBar(true);
});
