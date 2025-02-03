const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/models");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getQueryFromRule, getSessionDateRules } = require("../../../common/utils/rulesUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

const excludedRNCPs = [
  // "RNCP36730",
  // "RNCP28113",
  // "RNCP23827",
  // "RNCP36141",
  // "RNCP34143",
  // "RNCP38667",
  // "RNCP31115",
  // "RNCP37682",
  // "RNCP28668",
  // "RNCP36462",
  // "RNCP34149",
  // "RNCP30701",
  // "RNCP38924",
  // "RNCP6917",
  // "RNCP36408",
  // "RNCP19542",
  // "RNCP35027",
  // "RNCP36521",
  // "RNCP23937",
  // "RNCP29423",
  // "RNCP34211",
  // "RNCP34143",
  // "RNCP34999",
  // "RNCP37092",
  // "RNCP36022",
  // "RNCP34559",
  // "RNCP27413",
  // "RNCP32018",
  // "RNCP28669",
  // "RNCP27336",
  // "RNCP26602",
  // "RNCP35634",
  // "RNCP34882",
  // "RNCP27347",
  // "RNCP28491",
  // "RNCP37948",
  // "RNCP4113",
  // "RNCP38019",
  // "RNCP35061",
  // "RNCP6561",
  // "RNCP35003",
  // "RNCP1828",
  // "RNCP37292",
  // "RNCP37277",
  // "RNCP1901",
  // "RNCP17989",
  // "RNCP34372",
  // "RNCP38039",
  // "RNCP2469",
  // "RNCP36247",
  // "RNCP35527",
  // "RNCP26753",
  // "RNCP36997",
  // "RNCP34888",
  // "RNCP34283",
  // "RNCP38549",
  // "RNCP32291",
  // "RNCP38676",
  // "RNCP37511",
  // "RNCP13387",
  // "RNCP1876",
  // "RNCP38713",
  // "RNCP34788",
  // "RNCP4034",
  // "RNCP22928",
  // "RNCP34465",
  // "RNCP34628",
  // "RNCP35433",
  // "RNCP16325",
  // "RNCP17821",
  // "RNCP35758",
  // "RNCP37633",
  // "RNCP31114",
  // "RNCP37674",
  // "RNCP34898",
  // "RNCP37637",
  // "RNCP35194",
  // "RNCP36964",
  // "RNCP36485",
  // "RNCP34341",
  // "RNCP39359",
  // "RNCP29811",
  // "RNCP23872",
  // "RNCP39401",
  // "RNCP35027",
  // "RNCP34886",
  // "RNCP34399",
  // "RNCP36727",
  // "RNCP36507",
  // "RNCP14291",
  // "RNCP36480",
  // "RNCP35861",
  // "RNCP34253",
  // "RNCP34602",
  // "RNCP35103",
  // "RNCP27095",
  // "RNCP36612",
  // "RNCP35030",
  // "RNCP35165",
  // "RNCP38045",
  // "RNCP13070",
  // "RNCP13646",
  // "RNCP36397",
  // "RNCP34943",
  // "RNCP28176",
  // "RNCP36075",
  // "RNCP14506",
  // "RNCP36490",
  // "RNCP35547",
  // "RNCP38141",
  // "RNCP35970",
  // "RNCP13388",
  // "RNCP29830",
  // "RNCP4649",
  // "RNCP38442",
  // "RNCP37010",
  // "RNCP16889",
  // "RNCP27028",
  // "RNCP34881",
  // "RNCP31115",
  // "RNCP37682",
  // "RNCP24815",
  // "RNCP38472",
  // "RNCP34928",
  // "RNCP38039",
  // "RNCP34580",
  // "RNCP35106",
  // "RNCP12378",
  // "RNCP37836",
  // "RNCP34322",
  // "RNCP36886",
  // "RNCP15238",
  // "RNCP34471",
  // "RNCP34164",
  // "RNCP38602",
  // "RNCP31923",
  // "RNCP34977",
  // "RNCP38808",
  // "RNCP27812",
  // "RNCP39103",
  // "RNCP39115",
  // "RNCP34882",
  // "RNCP26923",
  // "RNCP34479",
  // "RNCP36662",
  // "RNCP29423",
  // "RNCP26733",
  // "RNCP37345",
  // "RNCP34343",
  // "RNCP37064",
  // "RNCP34620",
  // "RNCP34809",
  // "RNCP37839",
  // "RNCP27347",
  // "RNCP28749",
  // "RNCP34247",
  // "RNCP39221",
  // "RNCP35063",
  // "RNCP37056",
  // "RNCP37849",
  // "RNCP37075",
  // "RNCP31677",
  // "RNCP37949",
  // "RNCP34658",
  // "RNCP34496",
  // "RNCP36405",
  // "RNCP34457",
  // "RNCP34198",
  // "RNCP38945",
  // "RNCP34984",
  // "RNCP36127",
  // "RNCP34079",
  // "RNCP39063",
  // "RNCP36389",
  // "RNCP4699",
  // "RNCP6933",
  // "RNCP21709",
  // "RNCP9119",
  // "RNCP28108",
  // "RNCP37274",
  // "RNCP27596",
  // "RNCP38575",
  // "RNCP16575",
  // "RNCP37504",
  // "RNCP34975",
  // "RNCP38290",
  // "RNCP28751",
  // "RNCP36628",
  // "RNCP37104",
  // "RNCP34280",
  // "RNCP39408",
  // "RNCP1863",
  // "RNCP38721",
  // "RNCP31957",
  // "RNCP38134",
  // "RNCP34643",
  // "RNCP39111",
  // "RNCP34887",
  // "RNCP35663",
  // "RNCP34022",
  // "RNCP34464",
  // "RNCP34581",
  // "RNCP35634",
  // "RNCP34734",
  // "RNCP34441",
  // "RNCP34536",
  // "RNCP37634",
  // "RNCP35031",
  // "RNCP35268",
  // "RNCP3190",
  // "RNCP31901",
  // "RNCP34524",
  // "RNCP31678",
  // "RNCP37873",
  // "RNCP34564",
  // "RNCP37660",
  // "RNCP34576",
  // "RNCP34927",
  // "RNCP34465",
  // "RNCP34589",
  // "RNCP31113",
  // "RNCP37680",
  // "RNCP38047",
  // "RNCP34455",
  // "RNCP29550",
  // "RNCP37266",
  // "RNCP35679",
  // "RNCP36505",
  // "RNCP36143",
  // "RNCP37177",
  // "RNCP34798",
  // "RNCP35663",
  // "RNCP36117",
  // "RNCP36116",
  // "RNCP35856",
  // "RNCP39249",
  // "RNCP23001",
  // "RNCP37816",
  // "RNCP35106",
  // "RNCP39095",
  // "RNCP35218",
  // "RNCP38012",
  // "RNCP35983",
  // "RNCP34558",
  // "RNCP35768",
  // "RNCP39241",
  // "RNCP1829",
  // "RNCP35959",
  // "RNCP35861",
  // "RNCP35998",
  // "RNCP36267",
  // "RNCP36006",
  // "RNCP32340",
  // "RNCP38665",
  // "RNCP34796",
  // "RNCP37842",
  // "RNCP1796",
  // "RNCP38723",
  // "RNCP35687",
  // "RNCP36901",
  // "RNCP36522",
  // "RNCP34476",
  // "RNCP35747",
  // "RNCP36205",
  // "RNCP34568",
  // "RNCP36397",
  // "RNCP36501",
  // "RNCP35968",
  // "RNCP36892",
  // "RNCP34158",
  // "RNCP39180",
  // "RNCP35266",
  // "RNCP36382",
  // "RNCP36381",
  // "RNCP36916",
  // "RNCP34302",
  // "RNCP35093",
  // "RNCP36075",
  // "RNCP36073",
  // "RNCP36716",
  // "RNCP36728",
  // "RNCP39205",
  // "RNCP36406",
  // "RNCP37100",
  // "RNCP35542",
  // "RNCP34356",
  // "RNCP34340",
  // "RNCP35503",
  // "RNCP35870",
  // "RNCP39230",
  // "RNCP31966",
  // "RNCP35209",
  // "RNCP34463",
  // "RNCP35541",
  // "RNCP37169",
  // "RNCP37082",
  // "RNCP39401",
  // "RNCP36240",
  // "RNCP36390",
  // "RNCP37317",
  // "RNCP37865",
  // "RNCP37079",
  // "RNCP37527",
  // "RNCP37778",
  // "RNCP37974",
  // "RNCP37633",
  // "RNCP36490",
  // "RNCP35862",
  // "RNCP37786",
  // "RNCP38010",
  // "RNCP34249",
  // "RNCP39399",
  // "RNCP37787",
  // "RNCP38107",
  // "RNCP38478",
  // "RNCP34710",
  // "RNCP37275",
  // "RNCP37273",
  // "RNCP38667",
  // "RNCP39174",
  // "RNCP38667",
  // "RNCP37948",
  // "RNCP38019",
  // "RNCP38147",
  // "RNCP37643",
  // "RNCP37292",
  // "RNCP37277",
  // "RNCP39792",
  // "RNCP36247",
  // "RNCP36997",
  // "RNCP38549",
  // "RNCP38676",
  // "RNCP35433",
  // "RNCP39599",
  // "RNCP37633",
  // "RNCP37674",
  // "RNCP37637",
  // "RNCP36964",
  // "RNCP39359",
  // "RNCP39401",
  // "RNCP39623",
  // "RNCP36612",
  // "RNCP38045",
  // "RNCP36397",
  // "RNCP36075",
  // "RNCP36490",
  // "RNCP36490",
  // "RNCP38141",
  // "RNCP38442",
  // "RNCP37682",
  // "RNCP38039",
  // "RNCP36630",
  // "RNCP36886",
  // "RNCP38602",
  // "RNCP38808",
  // "RNCP38815",
  // "RNCP39103",
  // "RNCP39115",
  // "RNCP39221",
  // "RNCP37056",
  // "RNCP37949",
  // "RNCP36405",
  // "RNCP38945",
  // "RNCP36127",
  // "RNCP39063",
  // "RNCP36412",
  // "RNCP37159",
  // "RNCP36389",
  // "RNCP36208",
  // "RNCP36208",
  // "RNCP38575",
  // "RNCP38478",
  // "RNCP37660",
  // "RNCP38107",
  // "RNCP39249",
  // "RNCP37816",
  // "RNCP39095",
  // "RNCP39241",
  // "RNCP38665",
  // "RNCP38723",
  // "RNCP39180",
  // "RNCP39401",
  // "RNCP39399",
];

const run = async () => {
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    $and: [
      {
        published: true,
        $or: [{ catalogue_published: true }, { force_published: true }],
        rncp_code: {
          $nin: excludedRNCPs,
        },
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

  /** 1. On réinitialise les formations "à publier ..." à "non publiable en l'état" pour permettre le recalcule du statut initial */
  logger.debug({ type: "job" }, "Etape 1.");
  await Formation.updateMany(
    {
      parcoursup_statut_initial: { $ne: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT },
    },
    { $set: { parcoursup_statut_initial: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 2. On applique les règles de périmètres */
  logger.debug({ type: "job" }, "Etape 2.");

  const filterStatus = {
    // parcoursup_statut_initial: {
    //   $in: [
    //     PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    //     PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    //     PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    //     PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    //     PARCOURSUP_STATUS.A_PUBLIER,
    //     PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
    //   ],
    // },
  };

  // Les règles pour lesquelles on ne procède pas à des publications
  const statutsPublicationInterdite = [];

  const reglesPublicationInterdite = await ReglePerimetre.find({
    plateforme: "parcoursup",
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
              parcoursup_statut_initial: rule.statut,
            },
          },
        ]
      );
    }));

  // Les règles pour lesquelles on ne procède pas à des publications automatiques, mais qui peuvent être publiées par les instructeurs
  const statutsPublicationManuelle = [
    PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
    PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  ];

  const reglesPublicationManuelle = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: {
      $in: statutsPublicationManuelle,
    },
    is_deleted: { $ne: true },
  }).lean();

  reglesPublicationManuelle.length > 0 &&
    (await asyncForEach(reglesPublicationManuelle, async (rule) => {
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
              parcoursup_statut_initial: rule.statut,
            },
          },
        ]
      );
    }));

  // Les règles pour lesquelles on procède à des publications automatiques et qui peuvent être publiées par les instructeurs  const statusPublicationAutomatique = [AFFELNET_STATUS.A_PUBLIER];
  const statusPublicationAutomatique = [PARCOURSUP_STATUS.A_PUBLIER];

  const reglesPublicationAutomatique = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: {
      $in: statusPublicationAutomatique,
    },
    is_deleted: { $ne: true },
  }).lean();

  reglesPublicationAutomatique.length > 0 &&
    (await asyncForEach(reglesPublicationAutomatique, async (rule) => {
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
              parcoursup_statut_initial: rule.statut,
            },
          },
        ]
      );
    }));

  // Les règles des académies
  const academieRules = [
    ...reglesPublicationInterdite,
    // ...reglesPublicationManuelle,
    // ...reglesPublicationAutomatique,
  ].filter(({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0);

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterStatus,

          num_academie,
          ...getQueryFromRule(rule, true),
        },
        [
          {
            $set: {
              parcoursup_statut_initial: status,
            },
          },
        ]
      );
    });
  });
};

module.exports = { run };
