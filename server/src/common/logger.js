const config = require("config");
const util = require("util");
const bunyan = require("bunyan");
const PrettyStream = require("bunyan-prettystream");
const BunyanSlack = require("bunyan-slack");
const BunyanMongodbStream = require("bunyan-mongodb-stream");
const { Log } = require("./model/index");

const createStreams = () => {
  const { type = "stdout", level = "info" } = config?.log ?? {};
  const envName = config.env;

  const jsonStream = () => {
    return {
      name: "json",
      level,
      stream: process.stdout,
    };
  };

  const consoleStream = (type) => {
    const pretty = new PrettyStream();
    pretty.pipe(process[type]);
    return {
      name: "console",
      level,
      stream: pretty,
    };
  };

  const mongoDBStream = () => {
    return {
      name: "mongodb",
      level,
      stream: BunyanMongodbStream({ model: Log }),
    };
  };

  const slackStream = () => {
    const stream = new BunyanSlack(
      {
        webhook_url: config.slackWebhookUrl,
        iconUrl: "https://catalogue.apprentissage.education.gouv.fr/favicon.ico",
        customFormatter: (record, levelName) => {
          let type = record.type;
          let ip;
          if (type === "http") {
            ip = record.request?.headers?.["x-forwarded-for"];
            record = {
              url: record.request.url.relative,
              statusCode: record.response.statusCode,
              ...(record.error ? { message: record.error.message } : {}),
            };
          }
          return {
            text: util.format(
              `[${envName}] [%s]${type ? " (" + type + ")" : ""}${type === "http" ? ` [${ip}]` : ""} _%s_\
              ${`\`\`\`${record.msg ?? util.format(record)}\`\`\``}
              `,
              levelName.toUpperCase(),
              new Date().toLocaleString("fr-FR")
            ),
          };
        },
      },
      (error) => {
        console.error("Unable to send log to slack", error);
      }
    );

    return {
      name: "slack",
      level: "info",
      stream,
    };
  };

  const streams = [type === "json" ? jsonStream() : consoleStream(type), mongoDBStream()];
  if (config.slackWebhookUrl) {
    streams.push(slackStream());
  }
  return streams;
};

module.exports = bunyan.createLogger({
  name: config.appName,
  serializers: bunyan.stdSerializers,
  streams: createStreams(),
});
