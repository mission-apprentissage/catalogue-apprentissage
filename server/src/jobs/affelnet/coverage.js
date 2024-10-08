const { getAffelnetCoverage, getMatch } = require("../../logic/controller/coverage");
const { AffelnetFormation, Formation } = require("../../common/models");
const { runScript } = require("../scriptWrapper");
const logger = require("../../common/logger");
const { reconciliationAffelnet } = require("../../logic/controller/reconciliation");
const { AFFELNET_STATUS } = require("../../constants/status");
const { findNewFormations, findMultisiteFormationsFromL01 } = require("../../logic/finder/migrationFinder");
const { formation: formatFormation } = require("../../logic/controller/formater");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { cursor } = require("../../common/utils/cursor");

const formationCoverage = async ({ eraseInfo } = {}) => {
  await cursor(
    AffelnetFormation.find({
      $or: [{ code_mef: { $nin: [null, "AFFECTATION"] } }, { cle_ministere_educatif: { $ne: null } }],
      uai: { $ne: null },
    }).sort({ cle_ministere_educatif: -1 }),
    async (formation) => {
      logger.debug({ type: "job" }, formation.cle_ministere_educatif);

      let match;

      // if we got a the key, just check if we still have it
      if (formation.cle_ministere_educatif) {
        const matchingFormation = await getMatch({
          // published: true,
          cle_ministere_educatif: formation.cle_ministere_educatif,
        });

        if (matchingFormation && matchingFormation.length === 1) {
          match = {
            strength: "100",
            matching: matchingFormation,
          };

          // dans le cas où on reçoit une clé en L01 de Affelnet
          // on passe à "publié" toutes les formations de ce multi-site (si on trouve plusieurs sites)
          const multisiteFormations = await findMultisiteFormationsFromL01(
            { cle_ministere_educatif: formation.cle_ministere_educatif },
            formatFormation
          );
          if (multisiteFormations.length > 0) {
            await asyncForEach(multisiteFormations, async (multisiteFormation) => {
              await reconciliationAffelnet(formation, multisiteFormation, eraseInfo);
            });
          }
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

      if (formation.matching_mna_formation?.length === 1 && Number(formation.matching_type) >= 4) {
        await reconciliationAffelnet(formation, formation.matching_mna_formation[0], eraseInfo);
      }
    }
  );
};

const afCoverage = async ({ eraseInfo } = {}) => {
  logger.info({ type: "job" }, " -- AFFELNET COVERAGE: ⏳ -- ");

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

  // reset du code affelnet
  await Formation.updateMany({}, { $set: { affelnet_id: null } });

  // reset "publié" to "non publiable en l'état"
  await Formation.updateMany(
    { affelnet_statut: AFFELNET_STATUS.PUBLIE },
    { $set: { affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  await formationCoverage({ eraseInfo });

  logger.info({ type: "job" }, " -- AFFELNET COVERAGE : ✅  -- ");
};

module.exports = { afCoverage };

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const eraseInfo = args.includes("--eraseInfo");
    await afCoverage({ eraseInfo });
  });
}
