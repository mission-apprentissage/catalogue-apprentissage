const { getAffelnetCoverage, getMatch } = require("../../logic/controller/coverage");
const { paginator } = require("../../common/utils/paginator");
const { AffelnetFormation, Formation } = require("../../common/model");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { reconciliationAffelnet } = require("../../logic/controller/reconciliation");
const { AFFELNET_STATUS } = require("../../constants/status");
const { findNewFormations } = require("../formations/rcoConverter/converter/migrationFinder");
const { formation: formatFormation } = require("../../logic/controller/formater");

const formation = async () => {
  await paginator(
    AffelnetFormation,
    {
      filter: {
        $or: [{ code_mef: { $nin: [null, "AFFECTATION"] } }, { cle_ministere_educatif: { $ne: null } }],
        uai: { $ne: null },
      },
      limit: 100,
    },
    async (formation) => {
      let match;

      // if we got a the key, just check if we still have it
      if (formation.cle_ministere_educatif) {
        const matchingFormation = await getMatch({
          published: true,
          cle_ministere_educatif: formation.cle_ministere_educatif,
        });
        if (matchingFormation && matchingFormation.length === 1) {
          match = {
            strength: "100",
            matching: matchingFormation,
          };
        } else {
          // check if key has changed since last affelnet import
          const newFormation = await findNewFormations(
            { cle_ministere_educatif: formation.cle_ministere_educatif },
            formatFormation
          );
          if (newFormation && newFormation.length === 1) {
            match = {
              strength: "100",
              matching: newFormation,
            };
          }
        }
      }

      if (!match && (!formation.code_mef || formation.code_mef === "AFFECTATION")) {
        return;
      }

      if (!match) {
        match = await getAffelnetCoverage(formation);
      }

      if (!match) return;

      formation.matching_type = match.strength;
      formation.matching_mna_formation = match.matching;
      await formation.save();

      if (formation.matching_mna_formation?.length === 1 && Number(formation.matching_type) >= 3) {
        await reconciliationAffelnet(formation);
      }
    }
  );
};

const afCoverage = async () => {
  logger.info("Start Affelnet coverage");

  // reset matching first
  await AffelnetFormation.updateMany(
    {},
    {
      $set: {
        matching_type: null,
        matching_mna_formation: [],
      },
    }
  );

  // reset "publié" to "hors périmètre"
  await Formation.updateMany(
    { affelnet_statut: AFFELNET_STATUS.PUBLIE },
    { $set: { affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE, last_statut_update_date: Date.now() } }
  );

  logger.info("Start formation coverage");
  await formation();

  logger.info("End Affelnet coverage");
};

module.exports = afCoverage;

if (process.env.standalone) {
  runScript(async () => {
    await afCoverage();
  });
}
