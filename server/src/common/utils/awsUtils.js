const AWS = require("aws-sdk");
const config = require("config");
const fs = require("fs");
const logger = require("../logger");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: "eu-west-3",
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const getFileFromS3 = (key) => {
  return s3.getObject({ Bucket: "mna-bucket", Key: key }).createReadStream();
};
module.exports.getFileFromS3 = getFileFromS3;

const downloadAndSaveFileFromS3 = (from, to) => {
  logger.info(`Downloading and save file from S3 Bucket...`);

  return new Promise((re, rj) => {
    getFileFromS3(from)
      .pipe(fs.createWriteStream(to))
      .on("close", () => {
        logger.info(`Download done...`);
        re();
      })
      .on("error", (e) => {
        logger.info(`Download errored...`, e);
        rj(e);
      });
  });
};

module.exports.downloadAndSaveFileFromS3 = downloadAndSaveFileFromS3;
