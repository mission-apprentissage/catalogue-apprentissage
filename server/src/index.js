const Sentry = require("@sentry/node");
const server = require("./http/server");
const logger = require("./common/logger");
const config = require("config");
const createComponents = require("./common/components/components");

process.on("unhandledRejection", (e) => logger.error({ type: "core" }, "An unexpected error occurred", e));
process.on("uncaughtException", (e) => logger.error({ type: "core" }, "An unexpected error occurred", e));

console.log(config);

if (config.sentry?.dsn) {
  Sentry.init({
    dsn: config.sentry?.dsn,
    sendDefaultPii: true,
  });

  console.log("Sentry enabled");
}

(async function () {
  const components = await createComponents();
  const app = await server(components);

  app.listen(5000, () => logger.info(`${config.appName} - Server ready and listening on port ${5000}`));
})();
