const { serialize } = require("../../../common/utils/rulesUtils");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { ReglePerimetre } = require("../../../common/model");
const { cloneDeep } = require("lodash");
const { runScript } = require("../../scriptWrapper");
const {
  aPublierRules: afAPublierRules,
  aPublierSoumisAValidationRules: afAPublierSoumisAValidationRules,
} = require("../../pertinence/affelnet/rules");

const {
  aPublierVerifierAccesDirectPostBacRules: psPostBacRules,
  aPublierValidationRecteurRules: psAPublierRecteurRules,
  aPublierRules: psAPublierRules,
} = require("../../pertinence/parcoursup/rules");

const specificRulesNode = (rules) => {
  return rules["$or"];
};

const rulesReducer = (acc, rule) => {
  const niveaux = rule.niveau?.["$in"] ?? [rule.niveau];
  const diplomes = rule.diplome?.["$in"] ?? [rule.diplome];

  const rules = [];
  const baseRule = cloneDeep(rule);
  niveaux.forEach((niveau) => {
    diplomes.forEach((diplome) => {
      rules.push({ ...baseRule, niveau, diplome });
    });
  });

  return [...acc, ...rules];
};

const createRulesInDB = async (rules, plateforme, statut) => {
  await asyncForEach(rules, async ({ niveau, diplome, ...rest }) => {
    await new ReglePerimetre({
      plateforme,
      niveau,
      diplome,
      statut,
      regle_complementaire: serialize(rest),
      is_regle_nationale: true,
      last_update_who: "mna",
    }).save();
  });
};

const run = async () => {
  // affelnet
  const flatAfAPublierValidationRules = specificRulesNode(afAPublierSoumisAValidationRules).reduce(rulesReducer, []);
  await createRulesInDB(flatAfAPublierValidationRules, "affelnet", "à publier (soumis à validation)");

  const flatAfAPublierRules = specificRulesNode(afAPublierRules).reduce(rulesReducer, []);
  await createRulesInDB(flatAfAPublierRules, "affelnet", "à publier");

  // psup
  const flatPsPostBacRules = specificRulesNode(psPostBacRules).reduce(rulesReducer, []);
  await createRulesInDB(flatPsPostBacRules, "parcoursup", "à publier (vérifier accès direct postbac)");

  const flatPsAPublierRecteurRules = specificRulesNode(psAPublierRecteurRules).reduce(rulesReducer, []);
  await createRulesInDB(flatPsAPublierRecteurRules, "parcoursup", "à publier (soumis à validation Recteur)");

  const flatPsAPublierRules = specificRulesNode(psAPublierRules).reduce(rulesReducer, []);
  await createRulesInDB(flatPsAPublierRules, "parcoursup", "à publier");
};

runScript(async () => {
  await run();
});
