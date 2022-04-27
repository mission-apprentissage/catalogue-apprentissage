const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const config = require("config");
const logger = require("../common/logger");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const logMiddleware = require("./middlewares/logMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const apiKeyAuthMiddleware = require("./middlewares/apiKeyAuthMiddleware");
const tryCatch = require("./middlewares/tryCatchMiddleware");
const corsMiddleware = require("./middlewares/corsMiddleware");
const authMiddleware = require("./middlewares/authMiddleware");
const permissionsMiddleware = require("./middlewares/permissionsMiddleware");
const packageJson = require("../../package.json");
const formation = require("./routes/formation");
const formationSecure = require("./routes/formationSecure");
const report = require("./routes/report");
const auth = require("./routes/auth");
const user = require("./routes/user");
const role = require("./routes/role");
const password = require("./routes/password");
const stats = require("./routes/stats");
const esSearch = require("./routes/esSearch");
const esMultiSearchNoIndex = require("./routes/esMultiSearchNoIndex");
const parcoursup = require("./routes/parcoursup");
const etablissement = require("./routes/etablissement");
const etablissementSecure = require("./routes/etablissementSecure");
const upload = require("./routes/upload");
const alert = require("./routes/alert");
const reglePerimetre = require("./routes/reglePerimetre");
const reglePerimetreSecure = require("./routes/reglePerimetreSecure");
const swaggerSchema = require("../common/model/swaggerSchema");
const rateLimit = require("express-rate-limit");

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

module.exports = async (components, verbose = true) => {
  const { db } = components;
  const app = express();

  app.use(bodyParser.json({ limit: "50mb" }));
  // Parse the ndjson as text for ES proxy
  app.use(bodyParser.text({ type: "application/x-ndjson" }));

  app.use(corsMiddleware());
  verbose && app.use(logMiddleware());

  if (config.env != "dev") {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      saveUninitialized: false,
      resave: true,
      secret: config.auth.secret,
      // https://github.com/jdesboeufs/connect-mongo/blob/HEAD/MIGRATION_V4.md
      store: MongoStore.create({ client: db.getClient() }),
      cookie: {
        secure: config.env === "dev" ? false : true,
        maxAge: config.env === "dev" ? null : 30 * 24 * 60 * 60 * 1000,
        sameSite: "strict", // prevent csrf attack @see https://auth0.com/blog/cross-site-request-forgery-csrf/
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const apiLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 10, // 10 calls per IP per second
  });

  const apiPerimetreLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 100, // 100 calls per IP per second
  });

  const elasticLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 100, // 100 calls per IP per second
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 calls per minute
    message: "Too many calls from this IP, please try again after one minute",
  });

  app.use("/api/v1/docs", apiLimiter, swaggerUi.serve, swaggerUi.setup(swaggerSpecification));
  app.get(
    "/api/v1/schema.json",
    apiLimiter,
    tryCatch(async (req, res) => {
      return res.json(swaggerSpecification);
    })
  );

  app.use("/api/v1/entity", apiPerimetreLimiter, reglePerimetre());
  app.use("/api/v1/es/search", elasticLimiter, esSearch());
  app.use("/api/v1/search", elasticLimiter, esMultiSearchNoIndex());
  app.use("/api/v1/entity", apiLimiter, formation());
  app.use("/api/v1/entity", apiLimiter, report());
  app.use("/api/v1/entity", apiLimiter, etablissement(components));
  app.use("/api/v1/auth", authLimiter, auth(components));
  app.use("/api/v1/password", authLimiter, password(components));
  app.use("/api/v1/parcoursup", apiLimiter, parcoursup(components));
  app.use("/api/v1/entity", apiLimiter, alert());
  app.use(
    "/api/v1/admin",
    apiLimiter,
    apiKeyAuthMiddleware,
    permissionsMiddleware({ isAdmin: true }, ["page_gestion_utilisateurs"]),
    user(components)
  );
  app.use(
    "/api/v1/admin",
    apiLimiter,
    apiKeyAuthMiddleware,
    permissionsMiddleware({ isAdmin: true }, ["page_gestion_utilisateurs", "page_gestion_roles"]),
    role(components)
  );
  app.use("/api/v1/entity", apiLimiter, apiKeyAuthMiddleware, formationSecure());
  app.use("/api/v1/stats", apiLimiter, apiKeyAuthMiddleware, stats(components));
  app.use("/api/v1/entity", apiLimiter, apiKeyAuthMiddleware, etablissementSecure(components));
  app.use("/api/v1/upload", apiLimiter, permissionsMiddleware({ isAdmin: true }, ["page_upload"]), upload());
  app.use("/api/v1/entity", apiLimiter, apiKeyAuthMiddleware, reglePerimetreSecure());

  /** DEPRECATED */
  app.use("/api/es/search", elasticLimiter, esSearch());
  app.use("/api/search", elasticLimiter, esMultiSearchNoIndex());
  app.use("/api/entity", apiLimiter, formation());
  app.use("/api/entity", apiLimiter, report());
  app.use("/api/entity", apiLimiter, etablissement(components));
  app.use("/api/auth", authLimiter, auth(components));
  app.use("/api/password", authLimiter, password(components));
  app.use("/api/parcoursup", apiLimiter, parcoursup(components));
  app.use(
    "/api/admin",
    apiLimiter,
    authMiddleware,
    permissionsMiddleware({ isAdmin: true }, ["page_gestion_utilisateurs"]),
    user(components)
  );
  app.use(
    "/api/admin",
    apiLimiter,
    authMiddleware,
    permissionsMiddleware({ isAdmin: true }, ["page_gestion_utilisateurs", "page_gestion_roles"]),
    role(components)
  );
  app.use("/api/entity", apiLimiter, authMiddleware, formationSecure());
  app.use("/api/stats", apiLimiter, stats(components));
  app.use("/api/entity", apiLimiter, authMiddleware, etablissementSecure(components));
  app.use("/api/entity", apiLimiter, authMiddleware, reglePerimetreSecure());

  app.get(
    "/api",
    apiLimiter,
    tryCatch(async (req, res) => {
      verbose && logger.info("/api called - healthcheck");

      let mongodbStatus;
      try {
        await db.collection("rcoformation").stats();
        mongodbStatus = true;
      } catch (e) {
        mongodbStatus = false;
        logger.error("Healthcheck failed", e);
      }

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
