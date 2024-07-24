const path = require("path");
const config = require("config");
const { emptyDir } = require("fs-extra");
const { connectToMongo } = require("../../src/common/mongodb");

const testDataDir = path.join(__dirname, "../../.local/test");
let mongoHolder = null;

const connectToMongoForTests = async () => {
  if (!mongoHolder) {
    const uri = config.mongodb.uri.split("catalogue-apprentissage").join("catalogue-apprentissage_test");
    mongoHolder = await connectToMongo(uri);
  }
  return mongoHolder;
};

module.exports = {
  connectToMongoForTests,
  cleanAll: () => {
    const models = require("../../src/common/models");
    return Promise.all([emptyDir(testDataDir), ...Object.values(models).map((m) => m.deleteMany())]);
  },
};
