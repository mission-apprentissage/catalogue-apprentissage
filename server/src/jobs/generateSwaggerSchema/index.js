const fs = require("fs");
const mongoose = require("mongoose");
require("mongoose-schema-jsonschema")(mongoose);
const path = require("path");

const schemas = require("../../common/model/schema");

const { Schema } = mongoose;

const cleanSchema = (schema) => {
  const obj = { ...schema };
  for (const key of Object.keys(obj)) {
    if (obj[key]?.default === null) {
      obj[key].default = "null";
    }

    if (obj[key].select === false) {
      delete obj[key];
    }
  }
  return obj;
};

Object.keys(schemas).forEach((schemaName) => {
  if (schemaName === "formationSchema") {
    const schema = schemas[schemaName];
    const baseFilename = schemaName.replace("Schema", "");
    const eSchema = new Schema(cleanSchema(schema));
    const eJsonSchema = eSchema.jsonSchema();
    let sout = {};
    sout[baseFilename] = eJsonSchema;
    const edata = JSON.stringify(sout, null, 2);
    const content = `module.exports = ${edata};`; // FIXEME linter issue after generate
    fs.writeFileSync(path.resolve(__dirname, `../../common/model/swaggerSchema/${baseFilename}.js`), content);
  }
});
