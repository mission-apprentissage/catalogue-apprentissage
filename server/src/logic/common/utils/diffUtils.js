const { diff: deepObjectDiff } = require("deep-object-diff");

/**
 * Fonction permettant la comparaison champ à champ de deux règles de périmètre.
 *
 * @param {*} previousFormationP
 * @param {*} nextFormationP
 * @returns {updates: Object, keys: [String], length: Number}
 */
const diffReglePerimetre = (previousReglePerimetreP, nextReglePerimetreP) => {
  const {
    _id: _id1,
    __v: __v1,
    updates_history: updates_history1,
    created_at: created_at1,
    updated_at: updated_at1,
    last_update_at: last_update_at1,
    ...previousReglePerimetre
  } = previousReglePerimetreP;
  const {
    _id: _id2,
    __v: __v2,
    updates_history: updates_history2,
    created_at: created_at2,
    updated_at: updated_at2,
    last_update_at: last_update_at2,
    ...nextReglePerimetre
  } = nextReglePerimetreP;

  const diff = Object.keys(nextReglePerimetre).reduce((diff, key) => {
    if (previousReglePerimetre[key] === nextReglePerimetre[key]) return diff;
    return {
      ...diff,
      [key]: nextReglePerimetre[key],
    };
  }, {});

  return {
    updates: { ...diff, last_update_who: nextReglePerimetreP.last_update_who },
    keys: Object.keys({ ...diff, last_update_who: nextReglePerimetreP.last_update_who }),
    length: Object.keys({ ...diff, last_update_who: nextReglePerimetreP.last_update_who }).length,
  };
};

/**
 * Fonction permettant la comparaison champ à champ de deux formations.
 *
 * @param {*} previousFormationP
 * @param {*} nextFormationP
 * @returns {updates: Object, keys: [String], length: Number}
 */
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

  const compare = deepObjectDiff(previousFormation, nextFormation);
  const keys = Object.keys(compare);

  return { updates: keys.length ? compare : null, keys, length: keys.length };
};

/**
 * Fonction par défaut pour comparer deux entités mongoose
 *
 * @param {*} previousEntity
 * @param {*} nextEntity
 * @returns {updates: Object, keys: [String], length: Number}
 */
const diffEntity = (previousEntity, nextEntity) => {
  const {
    _id: _id1,
    __v: __v1,
    updates_history: updates_history1,
    created_at: created_at1,
    updated_at: updated_at1,
    ...previousEntityContent
  } = previousEntity;
  const {
    _id: _id2,
    __v: __v2,
    updates_history: updates_history2,
    created_at: created_at2,
    updated_at: updated_at2,
    ...nextEntityContent
  } = nextEntity;

  const compare = deepObjectDiff(previousEntityContent, nextEntityContent);
  const keys = Object.keys(compare);

  return { updates: keys.length ? compare : null, keys, length: keys.length };
};

/*
 * Build updates history
 */
const buildUpdatesHistory = (origin, updates, keys, date = new Date()) => {
  keys ??= Object.keys(origin);

  const from = keys.reduce((acc, key) => {
    acc[key] = origin[key];
    return acc;
  }, {});
  return [{ from, to: { ...updates }, updated_at: date }];
};

module.exports = { diffReglePerimetre, diffFormation, diffEntity, buildUpdatesHistory };
