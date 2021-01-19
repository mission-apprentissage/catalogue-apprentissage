const express = require("express");
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
// const formationSecure = require("./routes/formationSecure");
const convertedFormation = require("./routes/convertedFormation");
const convertedFormationSecure = require("./routes/convertedFormationSecure");
const report = require("./routes/report");
const rcoFormation = require("./routes/rcoFormation");
const secured = require("./routes/secured");
const login = require("./routes/login");
const authentified = require("./routes/authentified");
const admin = require("./routes/admin");
const password = require("./routes/password");
const stats = require("./routes/stats");
const esSearch = require("./routes/esSearch");
const esMultiSearchNoIndex = require("./routes/esMultiSearchNoIndex");
const psFormation = require("./routes/psFormation");
const pendingRcoFormation = require("./routes/pendingRcoFormation");

const swaggerSchema = require("../common/model/swaggerSchema");

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
  const checkJwtToken = authMiddleware(components);
  const adminOnly = permissionsMiddleware({ isAdmin: true });

  app.use(bodyParser.json({ limit: "50mb" }));
  // Parse the ndjson as text for ES proxy
  app.use(bodyParser.text({ type: "application/x-ndjson" }));

  app.use(corsMiddleware());
  app.use(logMiddleware());

  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecification));

  app.use("/api/v1/es/search", esSearch());
  app.use("/api/v1/search", esMultiSearchNoIndex());
  app.use("/api/v1/entity", formation());
  //app.use("/api/v1/entity", checkJwtToken, formationSecure());
  app.use("/api/v1/entity", convertedFormation());
  app.use("/api/v1/entity", checkJwtToken, convertedFormationSecure());
  app.use("/api/v1/entity", pendingRcoFormation());
  app.use("/api/v1/entity", report());
  app.use("/api/v1/rcoformation", rcoFormation());
  app.use("/api/v1/secured", apiKeyAuthMiddleware, secured());
  app.use("/api/v1/login", login(components));
  app.use("/api/v1/authentified", checkJwtToken, authentified());
  app.use("/api/v1/admin", checkJwtToken, adminOnly, admin(components));
  app.use("/api/v1/password", password(components));
  app.use("/api/v1/stats", checkJwtToken, adminOnly, stats(components));
  app.use("/api/v1/psformation", psFormation(components));

  /** DEPRECATED */
  app.use("/api/es/search", esSearch());
  app.use("/api/search", esMultiSearchNoIndex());
  app.use("/api/entity", formation());
  //app.use("/api/entity", checkJwtToken, formationSecure());
  app.use("/api/entity", convertedFormation());
  app.use("/api/entity", checkJwtToken, convertedFormationSecure());
  app.use("/api/entity", pendingRcoFormation());
  app.use("/api/entity", report());
  app.use("/api/rcoformation", rcoFormation());
  app.use("/api/secured", apiKeyAuthMiddleware, secured());
  app.use("/api/login", login(components));
  app.use("/api/authentified", checkJwtToken, authentified());
  app.use("/api/admin", checkJwtToken, adminOnly, admin(components));
  app.use("/api/password", password(components));
  app.use("/api/stats", checkJwtToken, adminOnly, stats(components));
  app.use("/api/psformation", psFormation(components));

  app.get(
    "/api",
    tryCatch(async (req, res) => {
      let mongodbStatus;
      logger.info("/api called");
      await db
        .collection("sample")
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
