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

  async generate(collection, added, updated, summary) {
    const date = DateTime.local().setLocale("fr").toFormat("dd MMMM yyyy");
    const titre = `[Webservice RCO] Rapport d'importation ${date}`;
    const to = config.rco.reportMailingList.split(",");
    await this.mailer.sendEmail(to, titre, this.getEmailTemplate("report"), {
      summary,
      added,
      updated,
      date,
    });
  }
}

const report = new Report();
module.exports = report;
