const { connectToMongo } = require("../mongodb");
const createUsers = require("./users");

module.exports = async (options = {}) => {
  const users = options.users || (await createUsers());
  const tco = options.tco;

  return {
    users,
    tco,
    db: options.db || (await connectToMongo()).db,
  };
};
