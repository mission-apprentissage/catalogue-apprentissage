const logger = require("../../common/logger");
const { Report } = require("../../common/model");
const config = require("config");

const cleanReports = async () => {
  try {
    const NB_DAYS_REPORTS_ARE_KEPT = Number(config?.retentionDays?.reports || 30);

    const date = new Date();
    date.setDate(date.getDate() - NB_DAYS_REPORTS_ARE_KEPT);

    const { deletedCount } = await Report.deleteMany({ date: { $lt: date } });
    logger.info(`Delete ${deletedCount} reports, older than ${date.toLocaleString()}`);
  } catch (err) {
    logger.error(err);
  }
};

module.exports = cleanReports;
