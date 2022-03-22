const fs = require("fs");
const path = require("path");
const schemas = require("../../common/model/schema");
const { getJsonFromMongooseSchema } = require("./mongooseUtils");
const prettier = require("prettier");
const packageJson = require("../../../package.json");

const generateSwaggerSchema = () => {
  Object.keys(schemas).forEach((schemaName) => {
    if (["formationSchema", "etablissementSchema"].includes(schemaName)) {
      const schema = schemas[schemaName];
      const baseFilename = schemaName.replace("Schema", "");
      const eJsonSchema = getJsonFromMongooseSchema(schema);

      let sout = {};
      sout[baseFilename] = eJsonSchema;
      const edata = JSON.stringify(sout, null, 2);
      const content = prettier.format(`module.exports = ${edata};`, { ...packageJson.prettier, parser: "babel" });

      fs.writeFileSync(path.resolve(__dirname, `../../common/model/swaggerSchema/${baseFilename}.js`), content);
    }
  });
};

module.exports = { generateSwaggerSchema };
