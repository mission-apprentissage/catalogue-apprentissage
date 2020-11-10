// require("dotenv").config({ path: "../../../.env" });
const env = require("env-var");
const path = require("path");
const createMailer = require("./mailer");
const { DateTime } = require("luxon");

class Report {
  constructor() {
    const config_smtp = {
      smtp: {
        host: env.get("SMTP_HOST").default("localhost").asString(),
        port: env.get("SMTP_PORT").default("1025").asString(),
        secure: env.get("SMTP_SECURE").default("false").asBoolStrict(),
        auth: {
          user: env.get("SMTP_AUTH_USER").asString(),
          pass: env.get("SMTP_AUTH_PASS").asString(),
        },
      },
    };
    this.mailer = createMailer(config_smtp);
  }

  getEmailTemplate(type = "report") {
    return path.join(__dirname, `${type}.mjml.ejs`);
  }

  async generate(collection, added, updated) {
    const date = DateTime.local().setLocale("fr").toFormat("dd MMMM yyyy");
    const titre = `[Webservice RCO] Rapport d'importation ${date}`;
    await this.mailer.sendEmail(
      [
        "antoine.bigard@beta.gouv.fr",
        "anne.becquet@beta.gouv.fr",
        "samir.benfares@beta.gouv.fr",
        "christ.bonraisin@pole-emploi.fr",
      ],
      titre,
      this.getEmailTemplate("report"),
      {
        added,
        updated,
        date,
      }
    );
  }
}

const report = new Report();
module.exports = report;
