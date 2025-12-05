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
 */

const serialize = require("./serialize");
const { cursor } = require("../../utils/cursor");
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/bulk_examples.html

let isMappingNeedingGeoPoint = false;

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

    // if (/geo_/.test(key)) {
    //   properties[key] = { type: "geo_point" };
    //   isMappingNeedingGeoPoint = true;
    // } else {
    switch (mongooseType) {
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
          case schema.paths[key].caster.instance === "String":
            properties[key] = {
              type: "text",
              fields: { keyword: { type: "keyword", ignore_above: 256 } },
              ...asciiFoldingParameters,
            };
            break;
          case schema.paths[key].caster.instance === "Boolean":
            properties[key] = { type: "boolean" };
            break;
          case schema.paths[key].caster.instance === "Date":
            properties[key] = { type: "date" };
            break;
          case schema.paths[key].caster.instance === "Embedded":
            properties[key] = {
              ...getMapping(schema.paths[key].schema, prefix + key, requireAsciiFolding),
            };
            break;
          case schema.paths[key].caster.instance === "Mixed":
            properties[key] = { type: "nested" };
            // console.warn("Mixed mongoose type for ", key);
            break;
          case schema.paths[key].caster.$isArraySubdocument:
            properties[key] = {
              type: "nested",
              ...getMapping(schema.paths[key].schema, prefix + key, requireAsciiFolding),
            };
            break;

          default:
            console.warn("Not handling array of mongoose type for ", key);
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
  // }

  // console.log(JSON.stringify(properties));

  return { properties };
}

let isHooksPaused = false;

/**
 *
 * @param {*} schema
 * @param {Object} options
 * @param {Client} options.esClient
 */
function Mongoosastic(schema, options) {
  const { esClient } = options;

  const mapping = getMapping(schema, "");

  const indexName = options.index;
  const typeName = "_doc";

  // ElasticSearch Client
  schema.statics.esClient = esClient;

  schema.statics.createMapping = async function createMapping(requireAsciiFolding = false) {
    try {
      const exists = await esClient.indices.exists({ index: indexName });

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
        await esClient.indices.create({ index: indexName, ...includeTypeNameParameters, ...asciiFoldingParameters });
      }
      const completeMapping = {};
      completeMapping[typeName] = getMapping(schema, "", requireAsciiFolding);

      await esClient.indices.putMapping({
        index: indexName,
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
    return new Promise(async (resolve, reject) => {
      try {
        const _opts = { index: indexName, type: typeName, refresh: refresh };
        _opts.body = serialize(this, mapping);
        _opts.id = this._id.toString();
        await esClient.index(_opts);
      } catch (e) {
        console.error(`Error index ${this._id.toString()}`, e.message || e, e?.meta?.body?.error?.reason);
        return reject();
      }
      resolve();
    });
  };

  schema.methods.unIndex = function schemaUnIndex() {
    return new Promise(async (resolve, reject) => {
      try {
        const _opts = { index: indexName, type: typeName, refresh: true };
        _opts.id = this._id.toString();

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
      } catch (e) {
        console.log(`Error delete ${this._id.toString()}`, e.message || e);
        return reject();
      }
      resolve();
    });
  };

  schema.statics.pauseAllMongoosaticHooks = function pauseAllMongoosaticHooks() {
    isHooksPaused = true;
    console.log(`Mongoose Hooks have been paused`);
  };

  schema.statics.startAllMongoosaticHooks = function startAllMongoosaticHooks() {
    isHooksPaused = false;
    console.log(`Mongoose Hooks have been actived`);
  };

  schema.statics.synchronize = async function synchronize(filter = {}, refresh = false) {
    await cursor(this.find(filter), async (doc) => {
      // console.log(doc._id);
      await doc.index(refresh);
    });

    await esClient.indices.refresh({
      index: indexName,
    });
  };

  schema.statics.unsynchronize = function unsynchronize() {
    return new Promise(async (resolve, reject) => {
      const exists = await esClient.indices.exists({ index: indexName });
      if (exists) {
        await esClient.indices.delete({ index: this.modelName });
      }
      resolve();
    });
  };

  const postDocumentRemove = (doc) => {
    if (isHooksPaused) return;
    if (doc) {
      const _doc = new doc.constructor(doc);
      return _doc.unIndex();
    }
  };

  const postDocumentSave = (doc) => {
    if (isHooksPaused) return;
    if (doc) {
      const _doc = new doc.constructor(doc);
      return _doc.index();
    }
  };

  async function postQuerySave(next) {
    const doc = await this.model.findOne(this.getQuery());

    console.log(doc);

    if (doc) {
      const _doc = new this.model(doc);

      console.log(_doc);
      return _doc.index();
    }
  }

  // async function postQuerySaveMany(query) {
  //   console.log("postQuerySaveMany", { query, this: this });
  // }

  // async function postQueryRemove(query) {
  //   console.log("postQueryRemove", { query, this: this });
  // }

  // async function postQueryRemoveMany(query) {
  //   console.log("postQueryRemoveMany", { query, this: this });
  // }

  /**
   * Use standard Mongoose Middleware hooks
   * to persist to Elasticsearch
   *
   * See https://mongoosejs.com/docs/7.x/docs/middleware.html#types-of-middleware
   */
  function setUpMiddlewareHooks(inSchema) {
    // Document middleware hooks
    inSchema.post("save", { document: true, query: false }, postDocumentSave);
    inSchema.post("updateOne", { document: true, query: false }, postDocumentSave);
    inSchema.post("deleteOne", { document: true, query: false }, postDocumentRemove);

    // // TODO: Query middleware hooks
    // inSchema.post("updateOne", { document: false, query: true }, postQuerySave);
    inSchema.post("findOneAndUpdate", { document: false, query: true }, postQuerySave);
    // inSchema.post("replaceOne", { document: false, query: true }, postQuerySave);
    // inSchema.post("findOneAndReplace", { document: false, query: true }, postQuerySave);

    // inSchema.post("insertMany", { document: false, query: true }, postQuerySaveMany);
    // inSchema.post("updateMany", { document: false, query: true }, postQuerySaveMany);

    // inSchema.post("deleteOne", { document: false, query: true }, postQueryRemove);
    // inSchema.post("findOneAndDelete", { document: false, query: true }, postQueryRemove);

    // inSchema.post("deleteMany", { document: false, query: true }, postQueryRemoveMany);
  }
  setUpMiddlewareHooks(schema);
}

module.exports = Mongoosastic;
