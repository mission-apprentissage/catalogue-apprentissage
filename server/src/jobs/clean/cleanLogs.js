const logger = require("../../common/logger");
const { Log } = require("../../common/model");
const config = require("config");

const cleanLogs = async () => {
  try {
    const NB_DAYS_LOGS_ARE_KEPT = Number(config?.retentionDays?.logs || 30);

    const date = new Date();
    date.setDate(date.getDate() - NB_DAYS_LOGS_ARE_KEPT);

    const { deletedCount } = await Log.deleteMany({ time: { $lt: date } });
    logger.info(`Delete ${deletedCount} logs, older than ${date.toLocaleString()}`);
  } catch (err) {
    logger.error(err);
  }
};

module.exports = cleanLogs;
