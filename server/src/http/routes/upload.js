const express = require("express");
const multer = require("multer");
const { mkdirp } = require("fs-extra");
const tryCatch = require("../middlewares/tryCatchMiddleware");

module.exports = () => {
  const router = express.Router();

  const UPLOAD_DIR = "/data/uploads";

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      mkdirp(UPLOAD_DIR, (err) => cb(err, UPLOAD_DIR));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage: storage }).single("file");

  router.post(
    "/",
    tryCatch(async (req, res) => {
      upload(req, res, function (err) {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(200).send(req.file);
      });
    })
  );

  return router;
};
