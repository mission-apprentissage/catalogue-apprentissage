/* eslint-disable no-unused-vars */
const { diff } = require("deep-object-diff");

const diffFormation = (previousFormationP, nextFormationP) => {
  const {
    _id: _id1,
    __v: __v1,
    updates_history: updates_history1,
    created_at: created_at1,
    updated_at: updated_at1,
    last_update_at: last_update_at1,
    distance_lieu_formation_etablissement_formateur: distance_1,
    ...previousFormation
  } = previousFormationP;
  const {
    _id: _id2,
    __v: __v2,
    updates_history: updates_history2,
    created_at: created_at2,
    updated_at: updated_at2,
    last_update_at: last_update_at2,
    distance_lieu_formation_etablissement_formateur: distance_2,
    ...nextFormation
  } = nextFormationP;

  const compare = diff(previousFormation, nextFormation);
  const keys = Object.keys(compare);

  return { updates: keys.length ? compare : null, keys, length: keys.length };
};

/*
 * Build updates history
 */
const buildUpdatesHistory = (origin, updates, keys, date = new Date()) => {
  const from = keys.reduce((acc, key) => {
    acc[key] = origin[key];
    return acc;
  }, {});
  return [{ from, to: { ...updates }, updated_at: date }];
};

module.exports = { diffFormation, buildUpdatesHistory };
