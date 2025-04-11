const express = require("express");
const multer = require("multer");
const { mkdirp, move } = require("fs-extra");
const sanitize = require("sanitize-filename");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const csvToJson = require("convert-csv-to-json");
const path = require("path");
const logger = require("../../common/logger");
const { afImportFormations } = require("../../jobs/affelnet/import");
const { afCoverage } = require("../../jobs/affelnet/coverage");
const { rebuildEsIndex } = require("../../jobs/esIndex/esIndex");
const { hasAccessTo } = require("../../common/utils/rolesUtils");
const { Formation } = require("../../common/models");
const { afConsoleStats } = require("../../jobs/affelnet/stats");
const { enableAlertMessage, disableAlertMessage } = require("../../jobs/scriptWrapper");

const DOCUMENTS = new Map([
  [
    "kit-apprentissage",
    {
      filename: "CodeDiplome_RNCP_latest_kit.csv",
      acl: "page_upload/kit-apprentissage",
    },
  ],
  [
    "affelnet-formations",
    {
      filename: "affelnet-import.xlsx",
      acl: "page_upload/affelnet-formations",
    },
  ],
  [
    "parcoursup-mefs",
    {
      filename: "mefs-parcoursup.csv",
      acl: "page_upload/parcoursup-mefs",
    },
  ],
]);

/**
 * check CSV file headers
 */
const hasCSVHeaders = (file, ...headers) => {
  const firstLine = file?.[0] ?? {};
  return headers.every((header) => Object.prototype.hasOwnProperty.call(firstLine, header));
};

module.exports = () => {
  const router = express.Router();

  const UPLOAD_DIR = "/data/uploads";

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      mkdirp(UPLOAD_DIR, (err) => cb(err, UPLOAD_DIR));
    },
    filename: function (req, file, cb) {
      const filename = sanitize(file.originalname);
      cb(null, `tmp-${filename}`);
    },
  });

  const upload = multer({ storage: storage }).single("file");

  router.post(
    "/",
    tryCatch(async (req, res) => {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(500).json(err);
        }

        const filename = sanitize(req.file.originalname);

        const src = path.join(UPLOAD_DIR, `tmp-${filename}`);
        const dest = path.join(UPLOAD_DIR, filename);

        let callback;

        // console.log({ filename, user: req.user });

        switch (filename) {
          case DOCUMENTS.get("affelnet-formations").filename:
            if (!hasAccessTo(req.user, DOCUMENTS.get("affelnet-formations").acl)) {
              return res.status(403).json({
                error: `Vous ne disposez pas des droits nécessaires pour déposer ce fichier`,
              });
            }

            callback = async () => {
              await afImportFormations();
              Formation.pauseAllMongoosaticHooks();
              await afCoverage();
              Formation.startAllMongoosaticHooks();
              await enableAlertMessage();
              await rebuildEsIndex("formation");
              await disableAlertMessage();
              await afConsoleStats();
            };
            break;

          case DOCUMENTS.get("kit-apprentissage").filename: {
            if (!hasAccessTo(req.user, DOCUMENTS.get("kit-apprentissage").acl)) {
              return res.status(403).json({
                error: `Vous ne disposez pas des droits nécessaires pour déposer ce fichier`,
              });
            }

            try {
              const tmpFile = csvToJson.getJsonFromCsv(src);
              if (!hasCSVHeaders(tmpFile, "Code_RNCP", "Code_Diplome")) {
                return res.status(400).json({
                  error: `Le contenu du fichier est invalide, il doit contenir les colonnes suivantes : "Code_RNCP;Code_Diplome" (et cette première ligne d'en-tête)`,
                });
              }
            } catch (error) {
              logger.error(
                {
                  type: "http",
                },
                error
              );
              return res.status(400).json({
                error: `Le contenu du fichier est invalide, il doit être au format CSV (;) et contenir les colonnes suivantes : "Code_RNCP;Code_Diplome" (et cette première ligne d'en-tête)`,
              });
            }

            break;
          }

          case DOCUMENTS.get("parcoursup-mefs").filename: {
            if (!hasAccessTo(req.user, DOCUMENTS.get("parcoursup-mefs").acl)) {
              return res.status(403).json({
                error: `Vous ne disposez pas des droits nécessaires pour déposer ce fichier`,
              });
            }

            try {
              const tmpFile = csvToJson.getJsonFromCsv(src);
              if (!hasCSVHeaders(tmpFile, "MEF")) {
                return res.status(400).json({
                  error: `Le contenu du fichier est invalide, il doit contenir la colonne suivante : "MEF" (et cette première ligne d'en-tête)`,
                });
              }
            } catch (error) {
              logger.error(
                {
                  type: "http",
                },
                error
              );
              return res.status(400).json({
                error: `Le contenu du fichier est invalide, il doit être au format CSV (;) et contenir la colonne suivante : "MEF" (et cette première ligne d'en-tête)`,
              });
            }

            break;
          }
          default:
            return res.status(400).json({ error: `Le type de fichier est invalide` });
        }

        // success, move the file
        await move(src, dest, { overwrite: true }, async (error) => {
          if (error) return logger.error({ type: "http" }, error);

          // launch cb if any
          await callback?.();
        });

        return res.status(200).send(req.file);
      });
    })
  );

  return router;
};
