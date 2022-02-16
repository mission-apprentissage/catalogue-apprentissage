const logger = require("../../common/logger");
const { Consumption } = require("../../common/model");

module.exports = async (req) => {
  try {
    const ip = req.headers["x-forwarded-for"]?.split(",").shift() || req.socket?.remoteAddress;
    const route = req.route ? `${req.baseUrl}${req.route?.path}` : req.url.split("?")[0];
    const method = req.method;

    try {
      await Consumption.findOneAndUpdate(
        { route, method, "consumers.ip": ip },
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
          route,
          method,
        },
        {
          $inc: { globalCallCount: 1 },
          $push: { consumers: { ip, callCount: 1 } },
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
