/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
/* eslint-disable consistent-return */
/* eslint-disable no-empty */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
"use strict";

/**
 * @typedef {import("@elastic/elasticsearch").Client} Client
 * @typedef {import("mongoose").Query} Query
 * @typedef {import("mongoose").Schema} Schema
 */

const serialize = require("./serialize");
const { cursor } = require("../../../utils/cursor");
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/bulk_examples.html

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMapping(schema, inPrefix = "", requireAsciiFolding = false) {
  const properties = {};
  const prefix = inPrefix !== "" ? `${inPrefix}.` : inPrefix;

  // paramètre optionnel indiquant que la recherche sur le champ est insensible à la casse et aux accents
  const asciiFoldingParameters = requireAsciiFolding
    ? {
        analyzer: "folding",
        search_analyzer: "folding",
      }
    : {};

  for (let i = 0; i < Object.keys(schema.paths).length; i++) {
    const key = Object.keys(schema.paths)[i];

    const exclude = ["id", "__v", "_id"];
    if (exclude.includes(key) || schema.paths[key]?.options?.noIndex === true) {
      continue;
    }
    const mongooseType = schema.paths[key].instance;

    if (schema.paths[key].options.es_mapping) {
      properties[key] = schema.paths[key].options.es_mapping;
      continue;
    }

    switch (mongooseType) {
      case "ObjectId":
      case "ObjectID":
      case "String": {
        properties[key] = {
          type: "text",
          fields: { keyword: { type: "keyword", ignore_above: 256 } },
          ...asciiFoldingParameters,
        };
        break;
      }
      case "Date":
        properties[key] = { type: "date" };
        break;
      case "Number":
        properties[key] = { type: "long" };
        break;
      case "Boolean":
        properties[key] = { type: "boolean" };
        break;
      case "Array":
        switch (true) {
          case schema.paths[key].embeddedSchemaType.instance === "ObjectId":
          case schema.paths[key].embeddedSchemaType.instance === "ObjectID":
          case schema.paths[key].embeddedSchemaType.instance === "String":
            properties[key] = {
              type: "text",
              fields: { keyword: { type: "keyword", ignore_above: 256 } },
              ...asciiFoldingParameters,
            };
            break;
          case schema.paths[key].embeddedSchemaType.instance === "Boolean":
            properties[key] = { type: "boolean" };
            break;
          case schema.paths[key].embeddedSchemaType.instance === "Date":
            properties[key] = { type: "date" };
            break;
          case schema.paths[key].embeddedSchemaType.instance === "Embedded":
            properties[key] = {
              ...getMapping(schema.paths[key].schema, prefix + key, requireAsciiFolding),
            };
            break;
          case schema.paths[key].embeddedSchemaType.instance === "Mixed":
            properties[key] = { type: "nested" };
            // console.warn("Mixed mongoose type for ", key);
            break;
          case schema.paths[key].embeddedSchemaType.instance === "DocumentArrayElement":
          case schema.paths[key].embeddedSchemaType.$isArraySubdocument:
            properties[key] = {
              type: "nested",
              ...getMapping(schema.paths[key].schema, prefix + key, requireAsciiFolding),
            };
            break;

          default:
            console.warn(
              "Not handling array of mongoose type ",
              schema.paths[key].embeddedSchemaType.instance,
              " for ",
              key
            );
            break;
        }
        break;
      case "Embedded":
        // console.error(schema.paths[key], schema.paths[key].schema);
        properties[key] = {
          ...getMapping(schema.paths[key].schema, prefix + key, requireAsciiFolding),
        };
        break;
      case "Mixed":
        // console.warn("Mixed mongoose type for ", key);
        properties[key] = {
          type: "nested",
        };

        break;
      default:
        console.warn("Not handling mongoose type : ", mongooseType, "for ", key);
        break;
    }

    // console.log(key, JSON.stringify(properties[key]));
  }

  // console.log(JSON.stringify(properties));

  return { properties };
}

/**
 * Use standard Mongoose Middleware hooks
 * to persist to Elasticsearch
 *
 * See https://mongoosejs.com/docs/7.x/docs/middleware.html#types-of-middleware
 *
 * @param  {Schema} schema
 *
 */
function setUpMiddlewareHooks(schema) {
  const postDocumentSave = (doc) => {
    if (schema.statics.hooksPaused) return;

    const logger = require("../../../logger");

    logger.debug?.({ type: "mongoosastic", index: schema.statics.indexName }, `POST DOCUMENT SAVE`);

    if (doc) {
      const _doc = new doc.constructor(doc);
      return _doc.index();
    }
  };

  const postDocumentRemove = (doc) => {
    if (schema.statics.hooksPaused) return;

    const logger = require("../../../logger");

    logger.debug?.({ type: "mongoosastic", index: schema.statics.indexName }, `POST DOCUMENT REMOVE`);

    if (doc) {
      const _doc = new doc.constructor(doc);
      return _doc.unIndex();
    }
  };

  async function postQuerySave() {
    if (schema.statics.hooksPaused) return;

    const logger = require("../../../logger");

    logger.debug?.({ type: "mongoosastic", index: schema.statics.indexName }, `POST QUERY SAVE`);

    const doc = await this.model.findOne(this._conditions);

    if (doc) {
      doc.index();
    }
  }

  async function postQuerySaveMany() {
    if (schema.statics.hooksPaused) return;

    const logger = require("../../../logger");

    logger.debug?.({ type: "mongoosastic", index: schema.statics.indexName }, `POST QUERY SAVE MANY`);

    for await (const doc of this.model.find(this._conditions)) {
      await doc.index();
    }
  }

  async function preQueryRemove() {
    if (schema.statics.hooksPaused) return;

    const logger = require("../../../logger");

    logger.debug?.({ type: "mongoosastic", index: schema.statics.indexName }, `PRE QUERY REMOVE`);

    const doc = await this.model.findOne(this._conditions);

    if (doc) {
      doc.unIndex();
    }
  }

  async function preQueryRemoveMany() {
    if (schema.statics.hooksPaused) return;

    const logger = require("../../../logger");

    logger.debug?.({ type: "mongoosastic", index: schema.statics.indexName }, `PRE QUERY REMOVE MANY`);

    for await (const doc of this.model.find(this._conditions)) {
      await doc.unIndex();
    }
  }

  // Document middleware hooks
  schema.post(["save", "updateOne"], { document: true, query: false }, postDocumentSave);
  schema.post(["deleteOne"], { document: true, query: false }, postDocumentRemove);

  // Query middleware hooks
  schema.post(["updateOne", "findOneAndUpdate"], { document: false, query: true }, postQuerySave);
  schema.post(["insertMany", "updateMany"], { document: false, query: true }, postQuerySaveMany);

  schema.pre(["deleteOne", "findOneAndDelete"], { document: false, query: true }, preQueryRemove);
  schema.pre("deleteMany", { document: false, query: true }, preQueryRemoveMany);
}

/**
 *
 * @param {*} schema
 * @param {Object} options
 * @param {Client} options.esClient
 */
module.exports.mongoosastic = (schema, options) => {
  const { esClient } = options;

  const mapping = getMapping(schema, "");

  const typeName = "_doc";

  // ElasticSearch Client
  schema.statics.esClient = esClient;

  schema.statics.indexName = options.index;

  schema.statics.hooksPaused = false;

  schema.statics.createMapping = async function createMapping(requireAsciiFolding = false) {
    try {
      const exists = await esClient.indices.exists({ index: schema.statics.indexName });

      let includeTypeNameParameters = { include_type_name: true };
      // isMappingNeedingGeoPoint || requireAsciiFolding ? { include_type_name: true } : {};

      let asciiFoldingParameters = requireAsciiFolding
        ? {
            body: {
              settings: {
                analysis: {
                  analyzer: {
                    folding: {
                      tokenizer: "standard",
                      filter: ["lowercase", "asciifolding"],
                    },
                  },
                },
                max_result_window: 100000,
              },
            },
          }
        : {};

      if (!exists) {
        await esClient.indices.create({
          index: schema.statics.indexName,
          ...includeTypeNameParameters,
          ...asciiFoldingParameters,
        });
      }
      const completeMapping = {};
      completeMapping[typeName] = getMapping(schema, "", requireAsciiFolding);

      await esClient.indices.putMapping({
        index: schema.statics.indexName,
        type: typeName,
        body: completeMapping,
        ...includeTypeNameParameters,
      });

      //console.log("result put : ",a);
    } catch (e) {
      let errorMsg = e.message;
      if (e.meta && e.meta.body) errorMsg = e.meta.body.error;
      console.log("Error update mapping", errorMsg || e);
    }
  };

  schema.methods.index = function schemaIndex(refresh = true) {
    if (!schema.statics.indexName || schema.statics.hooksPaused || !this._id) {
      return;
    }

    const logger = require("../../../logger");

    logger.debug?.({ type: "mongoosastic", index: schema.statics.indexName, identifiant: this._id }, "DOCUMENT INDEX");

    return new Promise(async (resolve, reject) => {
      try {
        const _opts = {
          index: schema.statics.indexName,
          type: typeName,
          refresh: refresh,
          id: this._id.toString(),
          body: serialize(this, mapping),
        };
        await esClient.index(_opts);
      } catch (error) {
        logger.error?.(
          { type: "mongoosastic", error },
          `Error indexing ${schema.statics.indexName} ${this._id.toString()}`
        );
        return reject();
      }
      resolve();
    });
  };

  schema.methods.unIndex = function schemaUnIndex() {
    if (!schema.statics.indexName || schema.statics.hooksPaused || !this._id) {
      return;
    }

    const logger = require("../../../logger");

    logger.debug?.(
      { type: "mongoosastic", index: schema.statics.indexName, identifiant: this._id },
      "DOCUMENT UNINDEX"
    );

    return new Promise(async (resolve, reject) => {
      try {
        const _opts = {
          index: schema.statics.indexName,
          type: typeName,
          refresh: true,
          id: this._id.toString(),
        };

        let tries = 3;
        while (tries > 0) {
          try {
            await esClient.delete(_opts);
            return resolve();
          } catch (e) {
            console.log(e);
            await timeout(500);
            --tries;
          }
        }
      } catch (error) {
        logger.error?.(
          {
            type: "mongoosastic",
            error,
          },
          `Error unindexing ${schema.statics.indexName} ${this._id.toString()}`
        );
        return reject();
      }
      resolve();
    });
  };

  schema.statics.pauseMongoosasticHooks = function pauseMongoosasticHooks() {
    const logger = require("../../../logger");

    logger?.info(
      { type: "mongoosastic", index: schema.statics.indexName },
      `Mongoose Hooks have been paused (previously: ${schema.statics.hooksPaused ? "paused" : "running"})`
    );
    schema.statics.hooksPaused = true;
  };

  schema.statics.startMongoosasticHooks = function startMongoosasticHooks() {
    const logger = require("../../../logger");

    logger?.info(
      { type: "mongoosastic", index: schema.statics.indexName },
      `Mongoose Hooks have been activated (previously: ${schema.statics.hooksPaused ? "paused" : "running"})`
    );
    schema.statics.hooksPaused = false;
  };

  schema.statics.synchronize = async function synchronize(filter = {}, refresh = false) {
    if (schema.statics.hooksPaused) {
      throw Error(
        `Hooks have been paused, you should reactivate them with Model.startMongoosasticHooks() before calling synchronise.`
      );
    }

    await cursor(this.find(filter), async (doc) => {
      // console.log(doc._id);
      await doc.index(refresh);
    });

    await esClient.indices.refresh({
      index: schema.statics.indexName,
    });
  };

  schema.statics.unsynchronize = function unsynchronize() {
    return new Promise(async (resolve, reject) => {
      const exists = await esClient.indices.exists({ index: schema.statics.indexName });
      if (exists) {
        await esClient.indices.delete({ index: schema.statics.indexName });
      }
      resolve();
    });
  };

  setUpMiddlewareHooks(schema);
};
