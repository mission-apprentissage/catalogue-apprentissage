const path = require("path");
const createMailer = require("../../common/mailer");
const { DateTime } = require("luxon");
const config = require("config");

// TODO to rewrite

const mailer = createMailer({ smtp: { ...config.smtp, secure: false } });

const getEmailTemplate = (type = "report") => {
  return path.join(__dirname, `${type}.mjml.ejs`);
};

const generate = async (collection, added, updated, summary, title, to, templateName = "report") => {
  const date = DateTime.local().setLocale("fr").toFormat("dd MMMM yyyy");
  const titre = `${title} ${date}`;
  await mailer.sendEmail(to, titre, getEmailTemplate(templateName), {
    summary,
    added,
    updated,
    date,
  });
};

module.exports.generate = generate;
