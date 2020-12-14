const logger = require("../../common/logger");
const { Log } = require("../../common/model");

const cleanLogs = async () => {
  try {
    const NB_DAYS_LOGS_ARE_KEPT = 30;

    const date = new Date();
    date.setDate(date.getDate() - NB_DAYS_LOGS_ARE_KEPT);

    const { deletedCount } = await Log.deleteMany({ time: { $lt: date } });
    logger.info(`Delete ${deletedCount} logs, older than ${date.toLocaleString()}`);
  } catch (err) {
    logger.error(err);
  }
};

module.exports = cleanLogs;
