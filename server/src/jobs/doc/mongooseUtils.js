const mongoose = require("mongoose");
require("mongoose-schema-jsonschema")(mongoose);

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

const getJsonFromMongooseSchema = (schema, options) => {
  const eSchema = new Schema(cleanMongooseSchema(schema), options);
  const eJsonSchema = eSchema.jsonSchema();
  return eJsonSchema;
};

module.exports = { getJsonFromMongooseSchema };
