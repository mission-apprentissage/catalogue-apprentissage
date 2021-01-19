const fs = require("fs");
const mongoose = require("mongoose");
require("mongoose-schema-jsonschema")(mongoose);
const path = require("path");

const schemas = require("../../common/model/schema");

const { Schema } = mongoose;

// Should not be use, issue https://github.com/deliveryhero/serverless-aws-documentation/blob/master/src/models.js#L9
const replaceNullDefault = (schem) => {
  const obj = { ...schem };
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(obj)) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj[key].hasOwnProperty("default") && obj[key].default === null) {
      obj[key].default = "null";
    }
  }
  return obj;
};

Object.keys(schemas).forEach((schemaName) => {
  if (schemaName === "mnaFormationSchema") {
    const schema = schemas[schemaName];
    const baseFilename = schemaName.replace("Schema", "");
    const eSchema = new Schema(replaceNullDefault(schema));
    const eJsonSchema = eSchema.jsonSchema();
    let sout = {};
    sout[baseFilename] = eJsonSchema;
    const edata = JSON.stringify(sout, null, 2);
    const content = `module.exports = ${edata};`;
    fs.writeFileSync(path.resolve(__dirname, `../../common/model/swaggerSchema/${baseFilename}.js`), content);
  }
});
