const express = require("express");
const multer = require("multer");
const { mkdirp, move } = require("fs-extra");
const sanitize = require("sanitize-filename");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const csvToJson = require("convert-csv-to-json");
const path = require("path");
const logger = require("../../common/logger");
const { importAffelnetFormations } = require("../../jobs/affelnet/import");

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

        switch (filename) {
          case "affelnet-import.xlsx":
            callback = importAffelnetFormations;
            break;
          case "CodeDiplome_RNCP_latest_kit.csv": {
            try {
              const tmpFile = csvToJson.getJsonFromCsv(src);
              if (!hasCSVHeaders(tmpFile, "Code_RNCP", "Code_Diplome")) {
                return res.status(400).json({
                  error: `Le contenu du fichier est invalide, il doit contenir les colonnes suivantes : "Code_RNCP;Code_Diplome" (et cette première ligne d'en-tête)`,
                });
              }
            } catch (e) {
              logger.error(e);
              return res.status(400).json({
                error: `Le contenu du fichier est invalide, il doit être au format CSV (;) et contenir les colonnes suivantes : "Code_RNCP;Code_Diplome" (et cette première ligne d'en-tête)`,
              });
            }
            break;
          }
          case "mefs-parcoursup.csv": {
            try {
              const tmpFile = csvToJson.getJsonFromCsv(src);
              if (!hasCSVHeaders(tmpFile, "MEF")) {
                return res.status(400).json({
                  error: `Le contenu du fichier est invalide, il doit contenir la colonne suivante : "MEF" (et cette première ligne d'en-tête)`,
                });
              }
            } catch (e) {
              logger.error(e);
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
        await move(src, dest, { overwrite: true }, (err) => {
          if (err) return logger.error(err);

          // launch cb if any
          callback?.();
        });

        return res.status(200).send(req.file);
      });
    })
  );

  return router;
};
