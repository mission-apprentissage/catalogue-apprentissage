const { connectToMongo } = require("../mongodb");
const createUsers = require("./users");
const createTableCorrespondace = require("./tables_correspondance");
const createCatalogue = require("./catalogue_old");
const createMailer = require("../../common/mailer");
const config = require("config");

module.exports = async (options = {}) => {
  const users = options.users || (await createUsers());
  const tableCorrespondance = options.tableCorrespondance || createTableCorrespondace();
  const catalogue = options.catalogue_old || createCatalogue();

  return {
    catalogue,
    users,
    tableCorrespondance,
    db: options.db || (await connectToMongo()).db,
    mailer: options.mailer || createMailer({ smtp: { ...config.smtp, secure: false } }),
  };
};
