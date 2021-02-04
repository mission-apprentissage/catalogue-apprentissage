const { connectToMongo } = require("../mongodb");
const createUsers = require("./users");
const createCatalogue = require("./catalogue");
const createMailer = require("../../common/mailer");
const config = require("config");

module.exports = async (options = {}) => {
  const users = options.users || (await createUsers());
  const catalogue = options.catalogue || createCatalogue();

  return {
    catalogue,
    users,
    db: options.db || (await connectToMongo()).db,
    mailer: options.mailer || createMailer({ smtp: { ...config.smtp, secure: false } }),
  };
};
