const path = require("path");
const createMailer = require("../../../common/mailer");
const { DateTime } = require("luxon");
const config = require("config");

class Report {
  constructor() {
    this.mailer = createMailer({ smtp: { ...config.smtp, secure: false } });
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
        // "anne.becquet@beta.gouv.fr",
        // "samir.benfares@beta.gouv.fr",
        // "christ.bonraisin@pole-emploi.fr",
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
