const { cloneDeep } = require("lodash");
const { runScript } = require("../../scriptWrapper");
const {
  aPublierRules: afAPublierRules,
  aPublierSoumisAValidationRules: afAPublierSoumisAValidationRules,
} = require("../../pertinence/affelnet/rules");

const {
  aPublierVerifierAccesDirectPostBacRules: psAPublierVerifierAccesDirectPostBacRules,
  aPublierValidationRecteurRules: psAPublierValidationRecteurRules,
  aPublierRules: psAPublierRules,
} = require("../../pertinence/parcoursup/rules");

const { toBePublishedRules } = require("../../common/utils/referenceUtils");

const specificRulesNode = (rules) => {
  return rules["$and"][rules["$and"].length - 1]["$or"];
};

const rulesReducer = (acc, rule) => {
  const niveaux = rule.niveau?.["$in"] ?? [rule.niveau];
  const diplomes = rule.diplome?.["$in"] ?? [rule.diplome];

  const rules = [];
  const baseRule = cloneDeep(rule);
  niveaux.forEach((niveau) => {
    diplomes.forEach((diplome) => {
      rules.push({ $and: [...toBePublishedRules, { ...baseRule, niveau, diplome }] });
    });
  });

  return [...acc, ...rules];
};

const run = async () => {
  // affelnet
  const flattenedAfAPublierSoumisAValidationRules = specificRulesNode(afAPublierSoumisAValidationRules).reduce(
    rulesReducer,
    []
  );
  console.log(
    "flattenedAfAPublierSoumisAValidationRules",
    flattenedAfAPublierSoumisAValidationRules.length,
    specificRulesNode(flattenedAfAPublierSoumisAValidationRules[2])
  );

  const flattenedAfAPublierRules = specificRulesNode(afAPublierRules).reduce(rulesReducer, []);
  console.log(
    "flattenedAfAPublierRules",
    flattenedAfAPublierRules.length,
    specificRulesNode(flattenedAfAPublierRules[0])
  );

  // psup
  const flattenedPsAPublierVerifierAccesDirectPostBacRules = specificRulesNode(
    psAPublierVerifierAccesDirectPostBacRules
  ).reduce(rulesReducer, []);
  console.log(
    "flattenedPsAPublierVerifierAccesDirectPostBacRules",
    flattenedPsAPublierVerifierAccesDirectPostBacRules.length,
    flattenedPsAPublierVerifierAccesDirectPostBacRules[0]["$and"][
      flattenedPsAPublierVerifierAccesDirectPostBacRules[0]["$and"].length - 1
    ]
  );

  const flattenedPsAPublierValidationRecteurRules = specificRulesNode(psAPublierValidationRecteurRules).reduce(
    rulesReducer,
    []
  );
  console.log(
    "flattenedPsAPublierValidationRecteurRules",
    flattenedPsAPublierValidationRecteurRules.length,
    flattenedPsAPublierValidationRecteurRules[0]["$and"][
      flattenedPsAPublierValidationRecteurRules[0]["$and"].length - 1
    ]
  );

  const flattenedPsAPublierRules = specificRulesNode(psAPublierRules).reduce(rulesReducer, []);
  console.log(
    "flattenedPsAPublierRules",
    flattenedPsAPublierRules.length,
    flattenedPsAPublierRules[0]["$and"][flattenedPsAPublierRules[0]["$and"].length - 1],
    flattenedPsAPublierRules[18]["$and"][flattenedPsAPublierRules[18]["$and"].length - 1]
  );
};

runScript(async () => {
  await run();
});
