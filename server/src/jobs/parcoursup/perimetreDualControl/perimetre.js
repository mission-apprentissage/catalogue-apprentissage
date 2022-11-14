const { DualControlFormation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const run = async () => {
  await DualControlFormation.updateMany(
    {},
    {
      $set: {
        parcoursup_perimetre: false,
      },
    }
  );

  const aPublierHabilitationRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    is_deleted: { $ne: true },
  }).lean();

  aPublierHabilitationRules.length > 0 &&
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            $or: aPublierHabilitationRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          parcoursup_perimetre: true,
        },
      }
    ));

  const aPublierVerifierAccesDirectPostBacRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    is_deleted: { $ne: true },
  }).lean();

  aPublierVerifierAccesDirectPostBacRules.length > 0 &&
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            $or: aPublierVerifierAccesDirectPostBacRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          parcoursup_perimetre: true,
        },
      }
    ));

  const aPublierValidationRecteurRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    is_deleted: { $ne: true },
  }).lean();

  aPublierValidationRecteurRules.length > 0 &&
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            $or: aPublierValidationRecteurRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          parcoursup_perimetre: true,
        },
      }
    ));

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  aPublierRules.length > 0 &&
    (await DualControlFormation.updateMany(
      {
        $and: [
          {
            $or: aPublierRules.map(getQueryFromRule),
          },
        ],
      },
      {
        $set: {
          parcoursup_perimetre: true,
        },
      }
    ));

  // apply academy rules
  const academieRules = [
    ...aPublierHabilitationRules,
    ...aPublierVerifierAccesDirectPostBacRules,
    ...aPublierValidationRecteurRules,
    ...aPublierRules,
  ].filter(({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0);

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      await DualControlFormation.updateMany(
        {
          $and: [
            {
              num_academie,
              ...getQueryFromRule(rule),
            },
          ],
        },
        {
          $set: {
            parcoursup_perimetre: status === "hors périmètre" ? false : true,
          },
        }
      );
    });
  });

  // stats
  const totalPérimètre = await DualControlFormation.countDocuments({ parcoursup_perimetre: true });
  const totalHorsPérimètre = await DualControlFormation.countDocuments({ parcoursup_perimetre: false });

  logger.info(
    `Total formations dans le périmètre: ${totalPérimètre}\n` +
      `Total formations hors périmètre : ${totalHorsPérimètre}`
  );
};

module.exports = { run };
