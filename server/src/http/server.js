const express = require("express");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const Sentry = require("@sentry/node");
const passport = require("passport");
const config = require("config");
const logger = require("../common/logger");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const logMiddleware = require("./middlewares/logMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const anyAuthMiddleware = require("./middlewares/anyAuthMiddleware");
const tryCatch = require("./middlewares/tryCatchMiddleware");
// const corsMiddleware = require("./middlewares/corsMiddleware");
const permissionsMiddleware = require("./middlewares/permissionsMiddleware");
const packageJson = require("../../package.json");
const swaggerSchema = require("../common/models/swaggerSchema");

require("../common/passport-config");

const formationRoutes = require("./routes/formation");
const candidatureRoutes = require("./routes/candidature");
const reportRoutes = require("./routes/report");
const authRoutes = require("./routes/auth");
const authSecureRoutes = require("./routes/authSecure");
const userRoutes = require("./routes/user");
const roleRoutes = require("./routes/role");
const passwordRoutes = require("./routes/password");
const statsRoutes = require("./routes/stats");
const datesRoutes = require("./routes/dates");
const esSearchRoutes = require("./routes/esSearch");
const esMultiSearchNoIndexRoutes = require("./routes/esMultiSearchNoIndex");
const parcoursupRoutes = require("./routes/parcoursup");
const etablissementRoutes = require("./routes/etablissement");
const uploadRoutes = require("./routes/upload");
const alertRoutes = require("./routes/alert");
const perimetrePriseRdvRoutes = require("./routes/perimetrePriseRdv");
const reglePerimetreRoutes = require("./routes/reglePerimetre");
const reglePerimetreSecureRoutes = require("./routes/reglePerimetreSecure");
const uaiAffelnetRoutes = require("./routes/uaiAffelnet");
const configRoutes = require("./routes/config");

const options = {
  definition: {
    openapi: "3.1.1",
    info: {
      title: "Catalogue apprentissage",
      version: "1.0.0",
      description: `Vous trouverez ici la définition de l'api catalogue apprentissage<br/><br/>
      <h3><strong>${config.publicUrl}/api/v1</strong></h3><br/>
      Contact:
      `,

      contact: {
        name: "Catalogue Apprentissage",
        url: "https://catalogue.apprentissage.education.gouv.fr",
        email: "catalogue-apprentissage@education.gouv.fr",
      },
    },
    externalDocs: {
      description: "Télécharger la spécification au format JSON",
      url: `${config.publicUrl}/api/v1/schema.json`,
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
    cookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "connect.sid",
    },
  },
};

module.exports = async (components, verbose = true) => {
  const { db } = components;
  const app = express();

  app.use(compression());
  app.use(bodyParser.json({ limit: "50mb" }));
  // Parse the ndjson as text for ES proxy
  app.use(bodyParser.text({ type: "application/x-ndjson" }));

  app.use(cors({ credentials: true }));
  // app.use(corsMiddleware());
  verbose && app.use(logMiddleware());

  // if (config.env != "local") {
  app.set("trust proxy", 1);
  // }

  app.use(
    session({
      saveUninitialized: false,
      resave: true,
      secret: config.auth.secret,
      // https://github.com/jdesboeufs/connect-mongo/blob/HEAD/MIGRATION_V4.md
      store: MongoStore.create({ client: db.getClient() }),
      cookie: {
        secure: config.env === "local" ? false : true,
        maxAge: config.env === "local" ? null : 30 * 24 * 60 * 60 * 1000,
        sameSite: config.env === "local" ? "lax" : "strict", // prevent csrf attack @see https://auth0.com/blog/cross-site-request-forgery-csrf/
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const apiLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 50, // 50 calls per IP per second
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
    max: 30, // Limit each IP to 30 calls per minute
    message: "Too many calls from this IP, please try again after one minute",
  });

  const prefixes = ["/api", "/api/v1"];

  const routes = [
    ["/docs", apiLimiter, swaggerUi.serve, swaggerUi.setup(swaggerSpecification)],
    [
      "/schema.json",
      apiLimiter,
      tryCatch(async (req, res) => {
        return res.json(swaggerSpecification);
      }),
    ],
    ["/auth", authLimiter, authSecureRoutes(components)],
    ["/auth", apiLimiter, authRoutes(components)],
    ["/password", authLimiter, passwordRoutes(components)],
  ];

  const securedRoutes = [
    ["/constants", apiLimiter, anyAuthMiddleware, datesRoutes()],
    ["/es/search", elasticLimiter, anyAuthMiddleware, esSearchRoutes()],
    ["/search", elasticLimiter, anyAuthMiddleware, esMultiSearchNoIndexRoutes()],
    ["/entity", anyAuthMiddleware, configRoutes()],
    ["/entity", apiLimiter, anyAuthMiddleware, formationRoutes()],
    ["/entity", apiLimiter, anyAuthMiddleware, reportRoutes()],
    ["/entity", apiLimiter, anyAuthMiddleware, etablissementRoutes(components)],
    ["/entity", apiLimiter, anyAuthMiddleware, alertRoutes()],
    ["/entity", apiLimiter, anyAuthMiddleware, candidatureRoutes()],
    ["/entity", apiPerimetreLimiter, anyAuthMiddleware, reglePerimetreRoutes()],
    ["/entity", apiLimiter, anyAuthMiddleware, reglePerimetreSecureRoutes()],

    [
      "/admin",
      apiLimiter,
      anyAuthMiddleware,
      permissionsMiddleware({ isAdmin: true }, ["page_gestion_utilisateurs"]),
      userRoutes(components),
    ],
    [
      "/admin",
      apiLimiter,
      anyAuthMiddleware,
      permissionsMiddleware({ isAdmin: true }, ["page_gestion_roles"]),
      roleRoutes(components),
    ],
    ["/stats", apiLimiter, anyAuthMiddleware, statsRoutes(components)],
    [
      "/upload",
      apiLimiter,
      anyAuthMiddleware,
      permissionsMiddleware({ isAdmin: true }, ["page_upload"]),
      uploadRoutes(),
    ],

    ["/parcoursup", apiLimiter, anyAuthMiddleware, parcoursupRoutes(components)],

    [
      "/perimetre-prise-rdv.json",
      apiLimiter,
      anyAuthMiddleware,
      permissionsMiddleware({ isAdmin: true }, ["page_other/perimetre_prise_rdv"]),
      perimetrePriseRdvRoutes(),
    ],

    [
      "/uai-affelnet",
      apiLimiter,
      anyAuthMiddleware,
      permissionsMiddleware({ isAdmin: true }, ["page_other/api-uai-affelnet"]),
      uaiAffelnetRoutes(),
    ],
  ];

  prefixes.map((prefix) => {
    [...routes, ...securedRoutes].map((route) => {
      const [path, ...rest] = route;
      app.use(`${prefix}${path}`, ...rest);
    });
  });

  app.get(
    "/api",
    apiLimiter,
    tryCatch(async (req, res) => {
      verbose && logger.info({ type: "http" }, "/api called - healthcheck");

      let mongodbStatus;
      try {
        await db.collection("formation").stats();
        mongodbStatus = true;
      } catch (e) {
        mongodbStatus = false;
        logger.error({ type: "http" }, "Healthcheck failed", e);
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

  app.get("/api/debug-sentry", () => {
    throw new Error("Test sentry");
  });

  Sentry.setupExpressErrorHandler(app);

  app.use(errorMiddleware());

  return app;
};
