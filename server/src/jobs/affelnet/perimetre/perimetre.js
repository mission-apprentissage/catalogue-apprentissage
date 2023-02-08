const { Formation } = require("../../../common/model");
const { getQueryFromRule, getCampagneStartDate, getCampagneEndDate } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");

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

  const formationsInPerimetre = new Set();
  const formationsNotInPerimetre = new Set();

  const aPublierSoumisAValidationRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    is_deleted: { $ne: true },
  }).lean();

  if (aPublierSoumisAValidationRules.length > 0) {
    (
      await Formation.find({
        ...filterReglement,
        ...filterDateCampagne,

        $or: aPublierSoumisAValidationRules.map(getQueryFromRule),
      }).select({ cle_ministere_educatif: 1 })
    ).forEach(({ cle_ministere_educatif }) => formationsInPerimetre.add(cle_ministere_educatif));
  }

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: AFFELNET_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  if (aPublierRules.length > 0) {
    (
      await Formation.find({
        ...filterReglement,
        ...filterDateCampagne,

        $or: aPublierRules.map(getQueryFromRule),
      }).select({ cle_ministere_educatif: 1 })
    ).forEach(({ cle_ministere_educatif }) => formationsInPerimetre.add(cle_ministere_educatif));
  }

  // apply academy rules
  const academieRules = [...aPublierSoumisAValidationRules, ...aPublierRules].filter(
    ({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0
  );

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      (
        await Formation.find({
          ...filterReglement,
          ...filterDateCampagne,

          num_academie,
          ...getQueryFromRule(rule),
        }).select({ cle_ministere_educatif: 1 })
      ).forEach(({ cle_ministere_educatif }) =>
        status === AFFELNET_STATUS.HORS_PERIMETRE
          ? formationsNotInPerimetre.add(cle_ministere_educatif)
          : formationsInPerimetre.add(cle_ministere_educatif)
      );
    });
  });

  // console.log({ formationsInPerimetre });
  // console.log({ formationsNotInPerimetre });

  await cursor(
    Formation.find({
      cle_ministere_educatif: { $in: [...formationsInPerimetre] },
      affelnet_perimetre: { $ne: true },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { affelnet_perimetre: true })
  );

  await cursor(
    Formation.find({
      cle_ministere_educatif: { $nin: [...formationsInPerimetre] },
      affelnet_perimetre: { $ne: false },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { affelnet_perimetre: false })
  );
};

module.exports = { run };
