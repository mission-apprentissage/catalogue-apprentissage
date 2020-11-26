const logger = require("../../common/logger");

module.exports = async (users) => {
  await users.createUser("testAdmin", "password", {
    email: "antoine.bigard@beta.gouv.fr",
    academie: "10,24",
    permissions: { isAdmin: true },
  });
  logger.info(`User 'testAdmin' with password 'password' and admin is successfully created `);
};
