const cliProgress = require("cli-progress");

/**
 * Display a progress bar to show a request progress
 *
 * @param {*} request
 * @param {*} callback
 */
const cursor = async (request, callback) => {
  const total = await request.countDocuments();
  const cursor = await request.cursor();

  let index = 0;

  // create a new progress bar instance and use shades_classic theme
  const progressBar = new cliProgress.SingleBar({ stopOnComplete: true }, cliProgress.Presets.shades_classic);

  progressBar?.start(total, index);

  for await (const item of cursor) {
    index += 1;

    await callback(item, callback);

    progressBar?.update(index);
  }

  progressBar?.stop();
};

module.exports = { cursor };
