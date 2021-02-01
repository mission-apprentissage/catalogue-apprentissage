const cliProgress = require("cli-progress");

const paginator = async (Model, { filter = {}, limit = 100, lean = false, showProgress = true } = {}, callback) => {
  let offset = 0;
  let computed = 0;
  let nbTotalItems = 10;

  // create a new progress bar instance and use shades_classic theme
  const progressBar = showProgress
    ? new cliProgress.SingleBar({ stopOnComplete: true }, cliProgress.Presets.shades_classic)
    : null;
  progressBar?.start(nbTotalItems, 0);

  while (computed < nbTotalItems) {
    let { docs, total } = await Model.paginate(filter, { offset, limit, lean });
    nbTotalItems = total;
    progressBar?.setTotal(nbTotalItems);

    await Promise.all(
      docs.map(async (item) => {
        computed += 1;
        await callback(item);
      })
    );
    offset += limit;
    progressBar?.update(computed);
  }
};

module.exports = { paginator };
