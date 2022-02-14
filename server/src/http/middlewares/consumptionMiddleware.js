const logger = require("../../common/logger");
const { Consumption } = require("../../common/model");

module.exports = () => {
  return async (req, res, next) => {
    try {
      const ip = req.headers["x-forwarded-for"]?.split(",").shift() || req.socket?.remoteAddress;
      const route = req.url.split("?")[0];

      const existingRouteConsumption = await Consumption.findOne({ route });

      console.log(existingRouteConsumption);

      if (!existingRouteConsumption) {
        await Consumption.create({
          route,
          globalCallCount: 1,
          consumers: [{ ip, callCount: 1 }],
        });
      } else {
        await Consumption.findOneAndUpdate(
          { _id: existingRouteConsumption._id },
          {
            ...existingRouteConsumption,
            globalCallCount: existingRouteConsumption.globalCallCount++,
            consumers: [
              ...existingRouteConsumption.consumers.filter((consumer) => consumer.ip !== ip),
              { ip, callCount: existingRouteConsumption.consumers.find((consumer) => consumer.ip === ip).callCount++ },
            ],
          }
        );
      }
    } catch (error) {
      logger.error(error);
    }

    next();
  };
};
