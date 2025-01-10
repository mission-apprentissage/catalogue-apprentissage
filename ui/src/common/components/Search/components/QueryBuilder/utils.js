export function mergedQueries(queries) {
  let obj = { must: [], must_not: [], should: [] };
  queries
    .filter((q) => q.query)
    .forEach((q, k) => {
      let combinator = q.combinator;
      if (k === 0) {
        combinator = queries.length === 1 ? "AND" : queries[1].combinator;
      }
      obj[combinator === "AND" ? "must" : "should"].push(q.query);
    });
  return obj;
}

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      // eslint-disable-next-line eqeqeq
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export function withUniqueKey(rules) {
  return rules.map((r) => ({ ...r, key: uuidv4() }));
}

// This function transforms a text to a french compatible regex.
// So this:
// "Voilà un château"
// Turns to that:
// "[Vv][oôöOÔÖ][iïîIÏÎ]l[àâäaÀÂÄA] [uùûüUÙÛÜ]n [cçÇC]h[àâäaÀÂÄA]t[éèêëeÉÈÊËE][àâäaÀÂÄA][uùûüUÙÛÜ]"
// It works (TM).
function toFrenchRegex(text) {
  return text
    .replace(/[éèêëeÉÈÊËE]/g, "[éèêëeÉÈÊËE]")
    .replace(/[àâäaÀÂÄA]/g, "[àâäaÀÂÄA]")
    .replace(/[cçÇC]/g, "[cçÇC]")
    .replace(/[iïîIÏÎ]/g, "[iïîIÏÎ]")
    .replace(/[oôöOÔÖ]/g, "[oôöOÔÖ]")
    .replace(/[uùûüUÙÛÜ]/g, "[uùûüUÙÛÜ]")
    .replace(/([bdfghjklmnpqrstvwxz])/gi, (w, x) => `[${x.toUpperCase()}${x.toLowerCase()}]`);
}

function notStrict(value) {
  return toFrenchRegex(escapeRegex(value));
}

function escapeRegex(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function suggestionQuery(key, value) {
  if (Array.isArray(key)) {
    return;
  }
  return {
    query: { match_all: {} },
    aggs: { [key]: { terms: { field: key, include: value, order: { _count: "desc" }, size: 10 } } },
    size: 0,
  };
}

function simpleOrNestedQuery(key, value, cb) {
  if (key.split(".").length > 2) {
    return {
      nested: {
        path: key.split(".")[0],
        query: cb(key, value),
      },
    };
  } else {
    return cb(key, value);
  }
}

function query(key, value, cb, shouldOrMust = "should") {
  if (Array.isArray(key)) {
    return { bool: { [shouldOrMust]: key.map((k) => simpleOrNestedQuery(k, value)) } };
  }

  return simpleOrNestedQuery(key, value, cb);
}

export const operators = [
  {
    value: "*",
    text: "contient",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ regexp: { [k]: `.*${notStrict(v)}.*` } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `.*${notStrict(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(`.*${notStrict(value)}.*`) } },
  },
  {
    value: "!*",
    text: "ne contient pas",
    useInput: true,
    query: (key, value) =>
      value &&
      query(key, value, (k, v) => ({
        bool: { must_not: { regexp: { [k]: `.*${notStrict(v)}.*` } } },
      })),
    suggestionQuery: (key, value) => suggestionQuery(key, `.*${notStrict(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $not: { $regex: new RegExp(`.*${notStrict(value)}.*`) } } },
  },
  {
    value: "==",
    text: "égal à",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ regexp: { [k]: notStrict(v) } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${notStrict(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(`${notStrict(value)}`) } },
  },
  {
    value: "!=",
    text: "différent de",
    useInput: true,
    query: (key, value) =>
      value && query(key, value, (k, v) => ({ bool: { must_not: { regexp: { [k]: notStrict(v) } } } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${notStrict(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $not: { $regex: new RegExp(`${notStrict(value)}`) } } },
  },

  {
    value: "^",
    text: "commence par",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ regexp: { [k]: `${notStrict(v)}.*` } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${notStrict(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(`^${notStrict(value)}`) } },
  },
  {
    value: "$",
    text: "termine par",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ regexp: { [k]: `.*${notStrict(v)}` } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `.*${notStrict(value)}`),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(`${notStrict(value)}$`) } },
  },
  {
    value: "===*",
    text: "contient (recherche stricte)",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ wildcard: { [k]: `*${v}*` } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `.*${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(`.*${escapeRegex(value)}.*`) } },
  },
  {
    value: "!==*",
    text: "ne contient pas (recherche stricte)",
    useInput: true,
    query: (key, value) =>
      value && query(key, value, (k, v) => ({ bool: { must_not: { wildcard: { [k]: `*${v}*` } } } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `.*${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $not: { $regex: new RegExp(`.*${escapeRegex(value)}.*`) } } },
  },
  {
    value: "===",
    text: "égal à (recherche stricte)",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ term: { [k]: v } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: value },
  },
  {
    value: "!==",
    text: "différent de (recherche stricte)",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ bool: { must_not: { term: { [k]: v } } } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $ne: value } },
  },

  {
    value: "===^",
    text: "commence par (recherche stricte)",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ wildcard: { [k]: `${v}*` } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(`^${escapeRegex(value)}`) } },
  },
  {
    value: "===$",
    text: "termine par (recherche stricte)",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ wildcard: { [k]: `*${v}` } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `.*${escapeRegex(value)}`),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(`${escapeRegex(value)}$`) } },
  },
  {
    value: ">=",
    text: "supérieur ou égal à",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ range: { [k]: { gte: v } } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $gte: value } },
  },
  {
    value: "<=",
    text: "inférieur ou égal à",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ range: { [k]: { lte: v } } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $lte: value } },
  },
  {
    value: ">",
    text: "strictement supérieur à",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ range: { [k]: { gt: v } } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $gt: value } },
  },
  {
    value: "<",
    text: "strictement inférieur à",
    useInput: true,
    query: (key, value) => value && query(key, value, (k, v) => ({ range: { [k]: { lt: v } } })),
    suggestionQuery: (key, value) => suggestionQuery(key, `${escapeRegex(value)}.*`),
    mongoQuery: (key, value) => value && { [key]: { $lt: value } },
  },
  {
    value: "∃",
    text: "existe",
    useInput: false,
    query: (key) =>
      query(key, null, (k) => ({
        bool: {
          // Must exists ...
          must: { exists: { field: k } },
          // ... and must be not empty.
          must_not: { term: { [k]: "" } },
        },
      })),
    mongoQuery: (key) => ({ [key]: { $exists: true } }),
  },
  {
    value: "!∃",
    text: "n'existe pas",
    useInput: false,
    query: (key) =>
      query(key, null, (k) => ({
        bool: {
          must_not: {
            bool: {
              // Must exists ...
              must: { exists: { field: k } },
              // ... and must be not empty.
              must_not: { term: { [k]: "" } },
            },
          },
        },
      })),
    mongoQuery: (key) => ({ [key]: { $exists: false } }),
  },
  {
    value: "*.",
    text: "regexp",
    useInput: true,
    query: (key, value) => query(key, value, (k, v) => ({ regexp: { [k]: `${v}` } })),
    mongoQuery: (key, value) => value && { [key]: { $regex: new RegExp(value) } },
  },
];

export const combinators = [
  { value: "AND", text: "ET" },
  { value: "OR", text: "OU" },
];
