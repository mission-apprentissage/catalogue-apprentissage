const { connectToMongo } = require("../mongodb");
const createUsers = require("./users");
// const catalogueModule = require("./catalogue");
const createMailer = require("../../common/mailer");
const config = require("config");

module.exports = async (options = {}) => {
  const users = options.users || (await createUsers());
  // const catalogue = options.catalogue || catalogueModule;

  const db = options.db || (await connectToMongo()).db;

  return {
    // catalogue,
    users,
    db,
    mailer: options.mailer || createMailer({ smtp: { ...config.smtp, secure: false } }),
  };
};
