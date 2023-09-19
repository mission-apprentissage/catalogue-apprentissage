const mongoose = require("mongoose");
require("mongoose-schema-jsonschema")(mongoose);

const { Schema } = mongoose;

const cleanMongooseSchema = (mongooseSchema) => {
  const obj = { ...mongooseSchema };
  for (const key of Object.keys(obj)) {
    if (obj[key].select === false) {
      delete obj[key];
    }

    if (obj[key]?.type instanceof mongoose.Schema) {
      obj[key].type = cleanMongooseSchema(obj[key].type.obj);
    }

    if (Array.isArray(obj[key]?.type) && obj[key]?.type[0] instanceof mongoose.Schema) {
      obj[key].type = obj[key].type.map((type) => cleanMongooseSchema(type.obj));
    }
  }

  return obj;
};

const getJsonFromMongooseSchema = (schema, options) => {
  const eSchema = new Schema(cleanMongooseSchema(schema), options);
  const eJsonSchema = eSchema.jsonSchema();
  return eJsonSchema;
};

module.exports = { cleanMongooseSchema, getJsonFromMongooseSchema };
