const { Formation } = require("../../../common/model");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const run = async () => {
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

  const aPublierHabilitationRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    is_deleted: { $ne: true },
  }).lean();

  aPublierHabilitationRules.length > 0 &&
    (
      await Formation.find({
        ...filterReglement,

        $or: aPublierHabilitationRules.map(getQueryFromRule),
      }).select({ cle_ministere_educatif: 1 })
    ).forEach(({ cle_ministere_educatif }) => formationsInPerimetre.add(cle_ministere_educatif));

  const aPublierVerifierAccesDirectPostBacRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    is_deleted: { $ne: true },
  }).lean();

  aPublierVerifierAccesDirectPostBacRules.length > 0 &&
    (
      await Formation.find({
        ...filterReglement,

        $or: aPublierVerifierAccesDirectPostBacRules.map(getQueryFromRule),
      }).select({ cle_ministere_educatif: 1 })
    ).forEach(({ cle_ministere_educatif }) => formationsInPerimetre.add(cle_ministere_educatif));

  const aPublierValidationRecteurRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    is_deleted: { $ne: true },
  }).lean();

  aPublierValidationRecteurRules.length > 0 &&
    (
      await Formation.find({
        ...filterReglement,
        // ...filterSessionDate,
        $or: aPublierValidationRecteurRules.map(getQueryFromRule),
      }).select({ cle_ministere_educatif: 1 })
    ).forEach(({ cle_ministere_educatif }) => formationsInPerimetre.add(cle_ministere_educatif));

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  aPublierRules.length > 0 &&
    (
      await Formation.find({
        ...filterReglement,
        $or: aPublierRules.map(getQueryFromRule),
      }).select({ cle_ministere_educatif: 1 })
    ).forEach(({ cle_ministere_educatif }) => formationsInPerimetre.add(cle_ministere_educatif));

  // apply academy rules
  const academieRules = [
    ...aPublierHabilitationRules,
    ...aPublierVerifierAccesDirectPostBacRules,
    ...aPublierValidationRecteurRules,
    ...aPublierRules,
  ].filter(({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0);

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      (
        await Formation.find({
          ...filterReglement,
          num_academie,
          ...getQueryFromRule(rule),
        }).select({ cle_ministere_educatif: 1 })
      ).forEach(({ cle_ministere_educatif }) =>
        status === PARCOURSUP_STATUS.NON_INTEGRABLE
          ? formationsNotInPerimetre.add(cle_ministere_educatif)
          : formationsInPerimetre.add(cle_ministere_educatif)
      );
    });
  });

  logger.debug({ type: "job" }, "- Intégration du périmètre");
  await cursor(
    Formation.find({
      cle_ministere_educatif: { $in: [...formationsInPerimetre] },
      parcoursup_perimetre: { $ne: true },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { parcoursup_perimetre: true })
  );

  logger.debug({ type: "job" }, "- Sortie du périmètre");
  await cursor(
    Formation.find({
      cle_ministere_educatif: { $nin: [...formationsInPerimetre] },
      parcoursup_perimetre: { $ne: false },
    }).select({
      cle_ministere_educatif: 1,
    }),
    async ({ cle_ministere_educatif }) =>
      await Formation.updateOne({ cle_ministere_educatif }, { parcoursup_perimetre: false })
  );
};

module.exports = { run };
