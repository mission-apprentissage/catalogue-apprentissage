const fs = require("fs");
const path = require("path");
const schemas = require("../../common/models/schema");
const prettier = require("prettier");
const packageJson = require("../../../package.json");
const m2s = require("mongoose-to-swagger");
const { createModel } = require("../../common/models/createModel");
const { cleanMongooseSchema } = require("./mongooseUtils");

const generateSwaggerSchema = () => {
  Array.from(schemas.keys()).forEach(async (schemaName) => {
    if (["formation", "etablissement"].includes(schemaName)) {
      const [schemaDescriptor, schemaOptions] = schemas.get(schemaName);
      const baseFilename = schemaName;
      const swaggerSchema = m2s(
        createModel(schemaName.toLowerCase(), [cleanMongooseSchema(schemaDescriptor), schemaOptions])
      );

      let sout = {};
      sout[baseFilename] = swaggerSchema;
      const edata = JSON.stringify(sout, null, 2);
      const content = await prettier.format(`module.exports = ${edata};`, { ...packageJson.prettier, parser: "babel" });

      fs.writeFileSync(path.resolve(__dirname, `../../common/models/swaggerSchema/${baseFilename}.js`), content);
    }
  });
};

module.exports = { generateSwaggerSchema };
