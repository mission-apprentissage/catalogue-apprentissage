const { DateTime } = require("luxon");
const { closeMongoConnection } = require("../common/mongodb");
const createComponents = require("../common/components/components");
const logger = require("../common/logger");
const config = require("config");
const { access, mkdir } = require("fs").promises;
const { Alert } = require("../common/models/index");

process.on("unhandledRejection", (e) => console.log(e));
process.on("uncaughtException", (e) => console.log(e));

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const createTimer = () => {
  let launchTime;
  return {
    start: () => {
      launchTime = DateTime.now();
    },
    stop: (results) => {
      const duration = launchTime.diffNow().negate().toFormat("hh:mm:ss.SSS");
      const data = results && results.toJSON ? results.toJSON() : results;
      data && console.log(JSON.stringify(data || {}, null, 2));
      console.log(`Completed in ${duration}`);
    },
  };
};

const ensureOutputDirExists = async () => {
  const outputDir = config.outputDir;
  try {
    await access(outputDir);
  } catch (e) {
    if (e.code !== "EEXIST") {
      await mkdir(outputDir, { recursive: true });
    }
  }
  return outputDir;
};

const exit = async (rawError) => {
  let error = rawError;
  if (rawError) {
    logger.error({ type: "job" }, rawError.constructor.name === "EnvVarError" ? rawError.message : rawError);
  }

  //Waiting logger to flush all logs (MongoDB)
  await timeout(250);

  try {
    await closeMongoConnection();
  } catch (closeError) {
    error = closeError;
    console.error(error);
  }

  process.exitCode = error ? 1 : 0;
};

const enableAlertMessage = async () => {
  await Alert.findOneAndUpdate(
    { type: "automatique" },
    { enabled: true },
    {
      upsert: true,
    }
  );
  console.log("Alert message enabled");
};

const disableAlertMessage = async () => {
  await Alert.findOneAndUpdate({ type: "automatique" }, { enabled: false });
  console.log("Alert message disabled");
};

module.exports = {
  /**
   * @param {() => void} job
   * @param {object} [options]
   * @param {boolean} options.alert Display alert on front
   */
  runScript: async (job, options) => {
    try {
      const timer = createTimer();
      timer.start();

      await ensureOutputDirExists();
      const components = await createComponents();
      options?.alert && (await enableAlertMessage());

      const results = await job(components);
      timer.stop(results);

      options?.alert && (await disableAlertMessage());
      await exit();
    } catch (e) {
      options?.alert && (await disableAlertMessage());
      await exit(e);
    }
  },
  enableAlertMessage,
  disableAlertMessage,
};
