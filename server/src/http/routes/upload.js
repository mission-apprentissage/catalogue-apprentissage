const express = require("express");
const multer = require("multer");
const { mkdirp, move } = require("fs-extra");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const csvToJson = require("convert-csv-to-json-latin");
const path = require("path");
const logger = require("../../common/logger");
const upsertEtablissements = require("../../jobs/etablissements/uai");

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
      cb(null, `tmp-${file.originalname}`);
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

        const src = path.join(UPLOAD_DIR, `tmp-${req.file.originalname}`);
        const dest = path.join(UPLOAD_DIR, req.file.originalname);

        let callback;

        switch (req.file.originalname) {
          case "BaseDataDock-latest.xlsx":
            // TODO implement when etablissements scripts are in tco lib
            break;
          case "latest_public_ofs.csv":
            // TODO implement when etablissements scripts are in tco lib
            break;
          case "affelnet-import.xlsx":
            break;
          case "CodeDiplome_RNCP_latest_kit.csv": {
            const tmpFile = csvToJson.getJsonFromCsv(src);
            if (!hasCSVHeaders(tmpFile, "Code RNCP", "Code Diplome")) {
              return res.status(400).json({
                error: `Le contenu du fichier est invalide, il doit contenir les colonnes suivantes : "Code RNCP", "Code Diplome"`,
              });
            }
            break;
          }
          case "uai-siret.csv": {
            const tmpFile = csvToJson.getJsonFromCsv(src);
            if (!hasCSVHeaders(tmpFile, "Uai", "Siret")) {
              return res.status(400).json({
                error: `Le contenu du fichier est invalide, il doit contenir les colonnes suivantes : "Uai", "Siret"`,
              });
            }
            callback = upsertEtablissements;
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
