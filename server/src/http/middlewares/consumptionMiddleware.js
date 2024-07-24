const logger = require("../../common/logger");
const { Consumption } = require("../../common/models");

module.exports = async (req) => {
  try {
    const referer = req.headers["referer"] && req.headers["referer"].split("/")[2];
    const origin = req.headers["origin"] && req.headers["origin"].split("/")[2];
    const xForwardedFor = req.headers["x-forwarded-for"] && req.headers["x-forwarded-for"]?.split(",").shift();
    const remoteAddress = req.socket?.remoteAddress;

    const caller = referer ?? origin ?? xForwardedFor ?? remoteAddress;
    const path = req.route ? `${req.baseUrl}${req.route?.path}` : req.url.split("?")[0];
    const method = req.method;
    const date = new Date().setUTCHours(0, 0, 0, 0);

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
