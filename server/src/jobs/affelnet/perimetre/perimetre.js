const { Formation } = require("../../../common/model");
const { getQueryFromRule, getCampagneStartDate, getCampagneEndDate } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");

const run = async () => {
  const next_campagne_debut = getCampagneStartDate();
  const next_campagne_end = getCampagneEndDate();

  const filterDateCampagne = {
    date_debut: { $gte: next_campagne_debut, $lt: next_campagne_end },
  };

  const filterReglement = {
    $and: [
      {
        published: true,
      },
      {
        $or: [{ catalogue_published: true }, { force_published: true }],
      },
      {
        $or: [
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP"],
            },
            "rncp_details.rncp_outdated": false,
          },
          {
            "rncp_details.code_type_certif": {
              $nin: ["Titre", "TP"],
            },
            cfd_outdated: false,
          },
        ],
      },
    ],
  };

  await Formation.updateMany({}, { $set: { affelnet_perimetre: false } });

  const aPublierSoumisAValidationRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    is_deleted: { $ne: true },
  }).lean();

  if (aPublierSoumisAValidationRules.length > 0) {
    await Formation.updateMany(
      {
        ...filterReglement,
        ...filterDateCampagne,

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
    await Formation.updateMany(
      {
        ...filterReglement,
        ...filterDateCampagne,

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
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterDateCampagne,

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
};

module.exports = { run };
