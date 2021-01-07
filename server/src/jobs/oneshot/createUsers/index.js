const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const config = require("config");
const path = require("path");
const { usersList } = require("./users");

const getEmailTemplate = (type = "forgotten-password") => {
  return path.join(__dirname, `../../../assets/templates/${type}.mjml.ejs`);
};

const createUsers = async ({ users, mailer }) => {
  try {
    logger.info(" -- Start create users -- ");

    await asyncForEach(usersList, async (userData) => {
      try {
        const payload = {
          username: userData.username.toLowerCase(),
          password: "1MotDePassTemporaire!",
          options: {
            academie: userData.academie,
            email: userData.email.toLowerCase(),
            roles: ["user"],
            permissions: {
              isAdmin: false,
            },
          },
        };

        const user = await users.createUser(payload.username, payload.password, payload.options);

        await mailer.sendEmail(
          user.email,
          `[${config.env} Catalogue apprentissage] Bienvenue`,
          getEmailTemplate("grettings"),
          {
            username: payload.username,
            tmpPwd: payload.password,
            publicUrl: config.publicUrl,
          }
        );
      } catch (e) {
        logger.error("unable to create user", e);
      }
    });

    logger.info(" -- End of create users -- ");
  } catch (err) {
    logger.error(err);
  }
};

runScript(async ({ users, mailer }) => {
  await createUsers({ users, mailer });
});
