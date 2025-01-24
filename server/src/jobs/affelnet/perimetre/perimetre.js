const { Formation } = require("../../../common/models");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/models");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { cursor } = require("../../../common/utils/cursor");
const logger = require("../../../common/logger");

const run = async () => {
  const filterReglement = {
    $and: [
      // {
      //   published: true,
      //   $or: [{ catalogue_published: true }, { force_published: true }],
      // },
      {
        $or: [
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP", null],
            },
            rncp_code: { $exists: true, $ne: null },
            "rncp_details.rncp_outdated": false,
          },
          {
            "rncp_details.code_type_certif": {
              $in: ["Titre", "TP", null],
            },
            rncp_code: { $eq: null },
            cfd_outdated: false,
          },
          {
            "rncp_details.code_type_certif": {
              $nin: ["Titre", "TP", null],
            },
            cfd_outdated: false,
          },
        ],
      },
    ],
  };

  const formationsInPerimetre = new Set();

  const statutsPublicationInterdite = [AFFELNET_STATUS.A_DEFINIR];
  const statutsPublicationManuelle = [AFFELNET_STATUS.A_PUBLIER_VALIDATION];
  const statusPublicationAutomatique = [AFFELNET_STATUS.A_PUBLIER];

  // apply national rules
  const reglesNationales = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: {
      $in: [...statutsPublicationManuelle, ...statusPublicationAutomatique],
    },
    is_deleted: { $ne: true },
  }).lean();

  reglesNationales.length > 0 &&
    (
      await Formation.find({
        ...filterReglement,

        $or: reglesNationales.map((rule) => getQueryFromRule(rule, false)),
      }).select({ cle_ministere_educatif: 1 })
    ).forEach(({ cle_ministere_educatif }) => formationsInPerimetre.add(cle_ministere_educatif));

  // apply academy rules
  const reglesAcademique = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: {
      $in: [
        ...statutsPublicationInterdite,
        // ...statutsPublicationManuelle,
        // ...statusPublicationAutomatique
      ],
    },
    is_deleted: { $ne: true },
    "statut_academies.0": { $exists: true },
  }).lean();

  await asyncForEach(reglesAcademique, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      (
        await Formation.find({
          ...filterReglement,

          num_academie,

          ...getQueryFromRule(rule, false),
        }).select({ cle_ministere_educatif: 1 })
      ).forEach(({ cle_ministere_educatif }) =>
        status === AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT
          ? formationsInPerimetre.delete(cle_ministere_educatif)
          : formationsInPerimetre.add(cle_ministere_educatif)
      );
    });
  });

  logger.debug({ type: "job" }, "- Intégration du périmètre");
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

  logger.debug({ type: "job" }, "- Sortie du périmètre");
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
