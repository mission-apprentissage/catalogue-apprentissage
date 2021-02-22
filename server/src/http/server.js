const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const config = require("config");
const logger = require("../common/logger");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const logMiddleware = require("./middlewares/logMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const tryCatch = require("./middlewares/tryCatchMiddleware");
const apiKeyAuthMiddleware = require("./middlewares/apiKeyAuthMiddleware");
const corsMiddleware = require("./middlewares/corsMiddleware");
const authMiddleware = require("./middlewares/authMiddleware");
const permissionsMiddleware = require("./middlewares/permissionsMiddleware");
const packageJson = require("../../package.json");
const formation = require("./routes/formation");
const convertedFormation = require("./routes/convertedFormation");
const convertedFormationSecure = require("./routes/convertedFormationSecure");
const report = require("./routes/report");
const rcoFormation = require("./routes/rcoFormation");
const secured = require("./routes/secured");
const auth = require("./routes/auth");
const authentified = require("./routes/authentified");
const admin = require("./routes/admin");
const password = require("./routes/password");
const stats = require("./routes/stats");
const esSearch = require("./routes/esSearch");
const esMultiSearchNoIndex = require("./routes/esMultiSearchNoIndex");
const parcoursup = require("./routes/parcoursup");
const pendingRcoFormation = require("./routes/pendingRcoFormation");
const affelnet = require("./routes/affelnet");
const etablissement = require("./routes/etablissement");

const swaggerSchema = require("../common/model/swaggerSchema");

require("../common/passport-config");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Catalogue apprentissage",
      version: "1.0.0",
      description: `Vous trouverez ici la définition de l'api catalogue apprentissage<br/><br/>
      <h3><strong>${config.publicUrl}/api/v1</strong></h3><br/>
      Contact:
      `,
      contact: {
        name: "Mission Nationale Apprentissage",
        url: "https://mission-apprentissage.gitbook.io/general/",
        email: "catalogue@apprentissage.beta.gouv.fr",
      },
    },
    servers: [
      {
        url: `${config.publicUrl}/api/v1`,
      },
    ],
  },
  apis: ["./src/http/routes/*.js"],
};

const swaggerSpecification = swaggerJsdoc(options);

swaggerSpecification.components = {
  schemas: swaggerSchema,
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
};

module.exports = async (components) => {
  const { db } = components;
  const app = express();
  const adminOnly = permissionsMiddleware({ isAdmin: true });

  app.use(bodyParser.json({ limit: "50mb" }));
  // Parse the ndjson as text for ES proxy
  app.use(bodyParser.text({ type: "application/x-ndjson" }));

  app.use(corsMiddleware());
  app.use(logMiddleware());

  if (config.env != "dev") {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      saveUninitialized: false,
      resave: true,
      secret: config.auth.secret,
      store: new MongoStore({ mongooseConnection: db }),
      cookie: {
        secure: config.env === "dev" ? false : true,
        maxAge: config.env === "dev" ? null : 30 * 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecification));

  app.use("/api/v1/es/search", esSearch());
  app.use("/api/v1/search", esMultiSearchNoIndex());
  app.use("/api/v1/entity", formation());
  app.use("/api/v1/entity", convertedFormation());
  app.use("/api/v1/entity", pendingRcoFormation());
  app.use("/api/v1/entity", report());
  app.use("/api/v1/rcoformation", rcoFormation());
  app.use("/api/v1/auth", auth(components));
  app.use("/api/v1/password", password(components));
  app.use("/api/v1/parcoursup", parcoursup(components));
  app.use("/api/v1/secured", apiKeyAuthMiddleware, secured());
  app.use("/api/v1/authentified", apiKeyAuthMiddleware, authentified());
  app.use("/api/v1/admin", apiKeyAuthMiddleware, adminOnly, admin(components));
  app.use("/api/v1/entity", apiKeyAuthMiddleware, convertedFormationSecure());
  app.use("/api/v1/stats", apiKeyAuthMiddleware, adminOnly, stats(components));
  app.use("/api/v1/affelnet", affelnet(components));
  app.use("/api/v1/entity", apiKeyAuthMiddleware, etablissement(components));

  /** DEPRECATED */
  app.use("/api/es/search", esSearch());
  app.use("/api/search", esMultiSearchNoIndex());
  app.use("/api/entity", formation());
  app.use("/api/entity", convertedFormation());
  app.use("/api/entity", pendingRcoFormation());
  app.use("/api/entity", report());
  app.use("/api/rcoformation", rcoFormation());
  app.use("/api/auth", auth(components));
  app.use("/api/password", password(components));
  app.use("/api/parcoursup", parcoursup(components));
  app.use("/api/secured", apiKeyAuthMiddleware, secured());
  app.use("/api/authentified", authMiddleware, authentified());
  app.use("/api/admin", authMiddleware, adminOnly, admin(components));
  app.use("/api/entity", authMiddleware, convertedFormationSecure());
  app.use("/api/stats", authMiddleware, adminOnly, stats(components));
  app.use("/api/affelnet", affelnet(components));

  app.get(
    "/api",
    tryCatch(async (req, res) => {
      let mongodbStatus;
      logger.info("/api called");
      await db
        .collection("rcoformation")
        .stats()
        .then(() => {
          mongodbStatus = true;
        })
        .catch((e) => {
          mongodbStatus = false;
          logger.error("Healthcheck failed", e);
        });

      return res.json({
        name: `Serveur Express Catalogue - ${config.appName}`,
        version: packageJson.version,
        env: config.env,
        healthcheck: {
          mongodb: mongodbStatus,
        },
      });
    })
  );

  // app.get(
  //   "/api/config",
  //   tryCatch(async (req, res) => {
  //     return res.json({
  //       config: config,
  //     });
  //   })
  // );

  app.use(errorMiddleware());

  return app;
};
