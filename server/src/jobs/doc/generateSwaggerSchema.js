const fs = require("fs");
const path = require("path");
const schemas = require("../../common/model/schema");
const { getJsonFromMongooseSchema } = require("./mongooseUtils");

const generateSwaggerSchema = () => {
  Object.keys(schemas).forEach((schemaName) => {
    if (["formationSchema", "etablissementSchema"].includes(schemaName)) {
      const schema = schemas[schemaName];
      const baseFilename = schemaName.replace("Schema", "");
      const eJsonSchema = getJsonFromMongooseSchema(schema);

      let sout = {};
      sout[baseFilename] = eJsonSchema;
      const edata = JSON.stringify(sout, null, 2);
      const content = `module.exports = ${edata};`; // FIXME linter issue after generate
      fs.writeFileSync(path.resolve(__dirname, `../../common/model/swaggerSchema/${baseFilename}.js`), content);
    }
  });
};

module.exports = { generateSwaggerSchema };
