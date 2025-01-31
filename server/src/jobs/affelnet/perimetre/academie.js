const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/models");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getQueryFromRule, getSessionDateRules } = require("../../../common/utils/rulesUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");

const run = async () => {
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    $and: [
      {
        published: true,
        $or: [{ catalogue_published: true }, { force_published: true }],
      },
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

  await Formation.updateMany(
    {
      affelnet_statut_a_definir: { $ne: false },
    },

    { $set: { affelnet_statut_a_definir: false } }
  );

  const filterStatus = {
    // affelnet_statut: {
    //   $in: [
    //     AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    //     AFFELNET_STATUS.A_DEFINIR,
    //     AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    //     AFFELNET_STATUS.A_PUBLIER,
    //     AFFELNET_STATUS.PRET_POUR_INTEGRATION,
    //   ],
    // },
  };

  // Les règles pour lesquelles on ne procède pas à des publications
  const statutsPublicationInterdite = [AFFELNET_STATUS.A_DEFINIR];

  const reglesPublicationInterdite = await ReglePerimetre.find({
    plateforme: "affelnet",
    statut: {
      $in: statutsPublicationInterdite,
    },
    is_deleted: { $ne: true },
  }).lean();

  reglesPublicationInterdite.length > 0 &&
    (await asyncForEach(reglesPublicationInterdite, async (rule) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterStatus,

          ...getQueryFromRule(rule, true),
        },
        [
          {
            $set: {
              affelnet_statut_a_definir: true,
            },
          },
        ]
      );
    }));
};

module.exports = { run };
