const { connectToMongo, mongoose } = require("../mongodb");
const createUsers = require("./users");
const createCatalogue = require("./catalogue");
const createMailer = require("../../common/mailer");
const config = require("config");
const { initTcoModel } = require("@mission-apprentissage/tco-service-node");

module.exports = async (options = {}) => {
  const users = options.users || (await createUsers());
  const catalogue = options.catalogue || createCatalogue();

  const db = options.db || (await connectToMongo()).db;
  try {
    await initTcoModel(mongoose, {});
  } catch (error) {
    console.log(error);
  }

  return {
    catalogue,
    users,
    db,
    mailer: options.mailer || createMailer({ smtp: { ...config.smtp, secure: false } }),
  };
};
