const { connectToMongo } = require("../mongodb");
const createUsers = require("./users");
const createTco = require("./tco");
const createCatalogue = require("./catalogue_old");
const createMailer = require("../../common/mailer");
const config = require("config");

module.exports = async (options = {}) => {
  const users = options.users || (await createUsers());
  const tco = options.tco || createTco();
  const catalogue = options.catalogue_old || createCatalogue();

  return {
    catalogue,
    users,
    tco,
    db: options.db || (await connectToMongo()).db,
    mailer: options.mailer || createMailer({ smtp: { ...config.smtp, secure: false } }),
  };
};
