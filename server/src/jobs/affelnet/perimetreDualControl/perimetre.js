const { DualControlFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { runScript } = require("../../scriptWrapper");

const run = async () => {
  await DualControlFormation.updateMany({}, { $set: { affelnet_perimetre: false } });

  const aPublierSoumisAValidationRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    is_deleted: { $ne: true },
  }).lean();

  if (aPublierSoumisAValidationRules.length > 0) {
    await DualControlFormation.updateMany(
      {
        $or: aPublierSoumisAValidationRules.map(getQueryFromRule),
      },
      {
        $set: {
          affelnet_perimetre: true,
        },
      }
    );
  }

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  if (aPublierRules.length > 0) {
    await DualControlFormation.updateMany(
      {
        $or: aPublierRules.map(getQueryFromRule),
      },
      {
        $set: {
          affelnet_perimetre: true,
        },
      }
    );
  }

  // apply academy rules
  const academieRules = [...aPublierSoumisAValidationRules, ...aPublierRules].filter(
    ({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0
  );

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      await DualControlFormation.updateMany(
        {
          num_academie,
          ...getQueryFromRule(rule),
        },
        {
          $set: {
            affelnet_perimetre: status === "hors périmètre" ? false : true,
          },
        }
      );
    });
  });

  // stats
  const totalPérimètre = await DualControlFormation.countDocuments({ affelnet_perimetre: true });
  const totalHorsPérimètre = await DualControlFormation.countDocuments({ affelnet_perimetre: false });

  logger.info(
    `Total formations dans le périmètre: ${totalPérimètre}\n` +
      `Total formations hors périmètre : ${totalHorsPérimètre}`
  );
};

module.exports = { run };

if (process.env.standaloneJobs) {
  runScript(async () => {
    await run();
  });
}
