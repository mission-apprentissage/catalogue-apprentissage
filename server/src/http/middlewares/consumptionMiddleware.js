const logger = require("../../common/logger");
const { Consumption } = require("../../common/model");

module.exports = async (req) => {
  try {
    const caller =
      req.headers["origin"] ?? (req.headers["x-forwarded-for"]?.split(",").shift() || req.socket?.remoteAddress);
    const path = req.route ? `${req.baseUrl}${req.route?.path}` : req.url.split("?")[0];
    const method = req.method;
    const date = new Date().toISOString().split("T")[0];

    try {
      await Consumption.findOneAndUpdate(
        { path, method, "consumers.caller": caller, "consumers.date": date },
        {
          $inc: { globalCallCount: 1, "consumers.$.callCount": 1 },
        },
        {
          upsert: true,
          new: false,
        }
      );
    } catch (error) {
      await Consumption.findOneAndUpdate(
        {
          path,
          method,
        },
        {
          $inc: { globalCallCount: 1 },
          $push: { consumers: { caller, date, callCount: 1 } },
        },
        {
          upsert: true,
        }
      );
    }
  } catch (error) {
    logger.error(error, "Error while collecting endpoint consumption.");
  }
};
