const fs = require("fs");
const mongoose = require("mongoose");
require("mongoose-schema-jsonschema")(mongoose);
const path = require("path");
const { compile } = require("json-schema-to-typescript");

const schemas = require("../../common/model/schema");

const { Schema } = mongoose;

const cleanMongooseSchema = (mongooseSchema) => {
  const obj = { ...mongooseSchema };
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

const disableAdditionalProperties = (node) => {
  if (node.properties) {
    node.additionalProperties = false;
    for (const key of Object.keys(node.properties)) {
      disableAdditionalProperties(node.properties[key]);
    }
  }
  if (node.items) {
    disableAdditionalProperties(node.items);
  }
};

const applyDateType = (node) => {
  if (node.format === "date-time") {
    node.tsType = "Date";
  }

  if (node.properties) {
    for (const key of Object.keys(node.properties)) {
      const field = node.properties[key];
      applyDateType(field);
    }
  }

  if (node.items) {
    applyDateType(node.items);
  }
};

const prepareJsonSchema = (jsonSchema) => {
  const schema = { ...jsonSchema };

  disableAdditionalProperties(schema);

  applyDateType(schema);

  return schema;
};

const generateSwaggerSchema = () => {
  Object.keys(schemas).forEach((schemaName) => {
    if (["formationSchema", "etablissementSchema"].includes(schemaName)) {
      const schema = schemas[schemaName];
      const baseFilename = schemaName.replace("Schema", "");
      const eSchema = new Schema(cleanMongooseSchema(schema));
      const eJsonSchema = eSchema.jsonSchema();
      let sout = {};
      sout[baseFilename] = eJsonSchema;
      const edata = JSON.stringify(sout, null, 2);
      const content = `module.exports = ${edata};`; // FIXME linter issue after generate
      fs.writeFileSync(path.resolve(__dirname, `../../common/model/swaggerSchema/${baseFilename}.js`), content);
    }
  });
};

const generateTypes = () => {
  Object.keys(schemas).forEach((schemaName) => {
    const schema = schemas[schemaName];
    const baseFilename = schemaName.replace("Schema", "");
    const eSchema = new Schema(cleanMongooseSchema(schema));
    const eJsonSchema = eSchema.jsonSchema();

    const jsonSchema = prepareJsonSchema(eJsonSchema);

    // if (["formationSchema"].includes(schemaName)) {
    //   let sout = {};
    //   sout[baseFilename] = jsonSchema;
    //   const edata = JSON.stringify(sout, null, 2);
    //   const content = edata;
    //   fs.writeFileSync(path.resolve(__dirname, `../../common/model/schema/${baseFilename}.jsonschema`), content);
    // }
    compile(jsonSchema, schemaName).then((ts) =>
      fs.writeFileSync(path.resolve(__dirname, `../../common/model/schema/${baseFilename}.d.ts`), ts)
    );
  });
};

generateSwaggerSchema();
generateTypes();
