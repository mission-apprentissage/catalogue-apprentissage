// here list the keys you want to rename to match model/schema/formation
const KEYS_MAP = {
  // e.g: below if we receive "code_diplome" and want to rename to "cfd"
  // code_diplome: "cfd",
};

const mapper = (obj, keysMap = KEYS_MAP) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      return [keysMap[key] ?? key, value];
    })
  );
};

module.exports = { mapper };
