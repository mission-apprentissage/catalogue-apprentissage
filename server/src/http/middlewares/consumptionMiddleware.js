const logger = require("../../common/logger");
const { Consumption } = require("../../common/model");

module.exports = () => {
  return async (req, res, next) => {
    try {
      const ip = req.headers["x-forwarded-for"]?.split(",").shift() || req.socket?.remoteAddress;
      const route = req.url.split("?")[0];

      const existingRouteConsumption = await Consumption.findOne({ route });

      const newConsumer = { ip, callCount: 1 };
      if (!existingRouteConsumption) {
        await Consumption.create({
          route,
          globalCallCount: 1,
          consumers: [newConsumer],
        });
      } else {
        let found;
        const consumers = existingRouteConsumption.consumers.reduce((acc, current, currentIndex, arr) => {
          found = found || current.ip === ip;
          acc[currentIndex] = current.ip === ip ? { ip, callCount: current.callCount++ } : current;

          if (currentIndex === arr.length - 1 && !found) {
            acc.push(newConsumer);
          }
          return acc;
        }, []);

        await Consumption.findOneAndUpdate(
          { _id: existingRouteConsumption._id },
          {
            globalCallCount: existingRouteConsumption.globalCallCount++,
            consumers,
          }
        );
      }
    } catch (error) {
      logger.error(error, "Error while collecting endpoint consumption.");
    }

    next();
  };
};
