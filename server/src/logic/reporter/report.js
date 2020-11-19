const path = require("path");
const createMailer = require("../../common/mailer");
const { DateTime } = require("luxon");
const config = require("config");

const mailer = createMailer({ smtp: { ...config.smtp, secure: false } });

const getEmailTemplate = (type = "report") => {
  return path.join(__dirname, `templates/${type}.mjml.ejs`);
};

const generate = async (data, title, to, templateName = "report") => {
  const date = DateTime.local().setLocale("fr").toFormat("dd MMMM yyyy");
  await mailer.sendEmail(to, `${title} ${date}`, getEmailTemplate(templateName), {
    ...data,
    date,
  });
};

module.exports = { generate };
