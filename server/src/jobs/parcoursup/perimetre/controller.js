const logger = require("../../../common/logger");
const { Formation, ReglePerimetre } = require("../../../common/models");
const { rncp_code } = require("../../../common/models/schema/formation/formation");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const {
  getQueryFromRule,
  getSessionStartDate,
  getSessionEndDate,
  getSessionDateRules,
} = require("../../../common/utils/rulesUtils");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { updateManyTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");

const excludedRNCPs = [
  "RNCP36730",
  "RNCP28113",
  "RNCP23827",
  "RNCP36141",
  "RNCP34143",
  "RNCP38667",
  "RNCP31115",
  "RNCP37682",
  "RNCP28668",
  "RNCP36462",
  "RNCP34149",
  "RNCP30701",
  "RNCP38924",
  "RNCP6917",
  "RNCP36408",
  "RNCP19542",
  "RNCP35027",
  "RNCP36521",
  "RNCP23937",
  "RNCP29423",
  "RNCP34211",
  "RNCP34143",
  "RNCP34999",
  "RNCP37092",
  "RNCP36022",
  "RNCP34559",
  "RNCP27413",
  "RNCP32018",
  "RNCP28669",
  "RNCP27336",
  "RNCP26602",
  "RNCP35634",
  "RNCP34882",
  "RNCP27347",
  "RNCP28491",
  "RNCP37948",
  "RNCP4113",
  "RNCP38019",
  "RNCP35061",
  "RNCP6561",
  "RNCP35003",
  "RNCP1828",
  "RNCP37292",
  "RNCP37277",
  "RNCP1901",
  "RNCP17989",
  "RNCP34372",
  "RNCP38039",
  "RNCP2469",
  "RNCP36247",
  "RNCP35527",
  "RNCP26753",
  "RNCP36997",
  "RNCP34888",
  "RNCP34283",
  "RNCP38549",
  "RNCP32291",
  "RNCP38676",
  "RNCP37511",
  "RNCP13387",
  "RNCP1876",
  "RNCP38713",
  "RNCP34788",
  "RNCP4034",
  "RNCP22928",
  "RNCP34465",
  "RNCP34628",
  "RNCP35433",
  "RNCP16325",
  "RNCP17821",
  "RNCP35758",
  "RNCP37633",
  "RNCP31114",
  "RNCP37674",
  "RNCP34898",
  "RNCP37637",
  "RNCP35194",
  "RNCP36964",
  "RNCP36485",
  "RNCP34341",
  "RNCP39359",
  "RNCP29811",
  "RNCP23872",
  "RNCP39401",
  "RNCP35027",
  "RNCP34886",
  "RNCP34399",
  "RNCP36727",
  "RNCP36507",
  "RNCP14291",
  "RNCP36480",
  "RNCP35861",
  "RNCP34253",
  "RNCP34602",
  "RNCP35103",
  "RNCP27095",
  "RNCP36612",
  "RNCP35030",
  "RNCP35165",
  "RNCP38045",
  "RNCP13070",
  "RNCP13646",
  "RNCP36397",
  "RNCP34943",
  "RNCP28176",
  "RNCP36075",
  "RNCP14506",
  "RNCP36490",
  "RNCP35547",
  "RNCP38141",
  "RNCP35970",
  "RNCP13388",
  "RNCP29830",
  "RNCP4649",
  "RNCP38442",
  "RNCP37010",
  "RNCP16889",
  "RNCP27028",
  "RNCP34881",
  "RNCP31115",
  "RNCP37682",
  "RNCP24815",
  "RNCP38472",
  "RNCP34928",
  "RNCP38039",
  "RNCP34580",
  "RNCP35106",
  "RNCP12378",
  "RNCP37836",
  "RNCP34322",
  "RNCP36886",
  "RNCP15238",
  "RNCP34471",
  "RNCP34164",
  "RNCP38602",
  "RNCP31923",
  "RNCP34977",
  "RNCP38808",
  "RNCP27812",
  "RNCP39103",
  "RNCP39115",
  "RNCP34882",
  "RNCP26923",
  "RNCP34479",
  "RNCP36662",
  "RNCP29423",
  "RNCP26733",
  "RNCP37345",
  "RNCP34343",
  "RNCP37064",
  "RNCP34620",
  "RNCP34809",
  "RNCP37839",
  "RNCP27347",
  "RNCP28749",
  "RNCP34247",
  "RNCP39221",
  "RNCP35063",
  "RNCP37056",
  "RNCP37849",
  "RNCP37075",
  "RNCP31677",
  "RNCP37949",
  "RNCP34658",
  "RNCP34496",
  "RNCP36405",
  "RNCP34457",
  "RNCP34198",
  "RNCP38945",
  "RNCP34984",
  "RNCP36127",
  "RNCP34079",
  "RNCP39063",
  "RNCP36389",
  "RNCP4699",
  "RNCP6933",
  "RNCP21709",
  "RNCP9119",
  "RNCP28108",
  "RNCP37274",
  "RNCP27596",
  "RNCP38575",
  "RNCP16575",
  "RNCP37504",
  "RNCP34975",
  "RNCP38290",
  "RNCP28751",
  "RNCP36628",
  "RNCP37104",
  "RNCP34280",
  "RNCP39408",
  "RNCP1863",
  "RNCP38721",
  "RNCP31957",
  "RNCP38134",
  "RNCP34643",
  "RNCP39111",
  "RNCP34887",
  "RNCP35663",
  "RNCP34022",
  "RNCP34464",
  "RNCP34581",
  "RNCP35634",
  "RNCP34734",
  "RNCP34441",
  "RNCP34536",
  "RNCP37634",
  "RNCP35031",
  "RNCP35268",
  "RNCP3190",
  "RNCP31901",
  "RNCP34524",
  "RNCP31678",
  "RNCP37873",
  "RNCP34564",
  "RNCP37660",
  "RNCP34576",
  "RNCP34927",
  "RNCP34465",
  "RNCP34589",
  "RNCP31113",
  "RNCP37680",
  "RNCP38047",
  "RNCP34455",
  "RNCP29550",
  "RNCP37266",
  "RNCP35679",
  "RNCP36505",
  "RNCP36143",
  "RNCP37177",
  "RNCP34798",
  "RNCP35663",
  "RNCP36117",
  "RNCP36116",
  "RNCP35856",
  "RNCP39249",
  "RNCP23001",
  "RNCP37816",
  "RNCP35106",
  "RNCP39095",
  "RNCP35218",
  "RNCP38012",
  "RNCP35983",
  "RNCP34558",
  "RNCP35768",
  "RNCP39241",
  "RNCP1829",
  "RNCP35959",
  "RNCP35861",
  "RNCP35998",
  "RNCP36267",
  "RNCP36006",
  "RNCP32340",
  "RNCP38665",
  "RNCP34796",
  "RNCP37842",
  "RNCP1796",
  "RNCP38723",
  "RNCP35687",
  "RNCP36901",
  "RNCP36522",
  "RNCP34476",
  "RNCP35747",
  "RNCP36205",
  "RNCP34568",
  "RNCP36397",
  "RNCP36501",
  "RNCP35968",
  "RNCP36892",
  "RNCP34158",
  "RNCP39180",
  "RNCP35266",
  "RNCP36382",
  "RNCP36381",
  "RNCP36916",
  "RNCP34302",
  "RNCP35093",
  "RNCP36075",
  "RNCP36073",
  "RNCP36716",
  "RNCP36728",
  "RNCP39205",
  "RNCP36406",
  "RNCP37100",
  "RNCP35542",
  "RNCP34356",
  "RNCP34340",
  "RNCP35503",
  "RNCP35870",
  "RNCP39230",
  "RNCP31966",
  "RNCP35209",
  "RNCP34463",
  "RNCP35541",
  "RNCP37169",
  "RNCP37082",
  "RNCP39401",
  "RNCP36240",
  "RNCP36390",
  "RNCP37317",
  "RNCP37865",
  "RNCP37079",
  "RNCP37527",
  "RNCP37778",
  "RNCP37974",
  "RNCP37633",
  "RNCP36490",
  "RNCP35862",
  "RNCP37786",
  "RNCP38010",
  "RNCP34249",
  "RNCP39399",
  "RNCP37787",
  "RNCP38107",
  "RNCP38478",
  "RNCP34710",
  "RNCP37275",
  "RNCP37273",
  "RNCP38667",
  "RNCP39174",
  "RNCP38667",
  "RNCP37948",
  "RNCP38019",
  "RNCP38147",
  "RNCP37643",
  "RNCP37292",
  "RNCP37277",
  "RNCP39792",
  "RNCP36247",
  "RNCP36997",
  "RNCP38549",
  "RNCP38676",
  "RNCP35433",
  "RNCP39599",
  "RNCP37633",
  "RNCP37674",
  "RNCP37637",
  "RNCP36964",
  "RNCP39359",
  "RNCP39401",
  "RNCP39623",
  "RNCP36612",
  "RNCP38045",
  "RNCP36397",
  "RNCP36075",
  "RNCP36490",
  "RNCP36490",
  "RNCP38141",
  "RNCP38442",
  "RNCP37682",
  "RNCP38039",
  "RNCP36630",
  "RNCP36886",
  "RNCP38602",
  "RNCP38808",
  "RNCP38815",
  "RNCP39103",
  "RNCP39115",
  "RNCP39221",
  "RNCP37056",
  "RNCP37949",
  "RNCP36405",
  "RNCP38945",
  "RNCP36127",
  "RNCP39063",
  "RNCP36412",
  "RNCP37159",
  "RNCP36389",
  "RNCP36208",
  "RNCP36208",
  "RNCP38575",
  "RNCP38478",
  "RNCP37660",
  "RNCP38107",
  "RNCP39249",
  "RNCP37816",
  "RNCP39095",
  "RNCP39241",
  "RNCP38665",
  "RNCP38723",
  "RNCP39180",
  "RNCP39401",
  "RNCP39399",
];

const run = async () => {
  const sessionStartDate = await getSessionStartDate();
  const sessionEndDate = await getSessionEndDate();
  const filterSessionDate = await getSessionDateRules();

  const filterReglement = {
    published: true,
    $or: [{ catalogue_published: true }, { force_published: true }],
    $and: [
      {
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
            rncp_code: {
              $exists: true,
              $ne: null,
            },
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

  const campagneCount = await Formation.countDocuments(filterSessionDate);

  logger.debug({ type: "job" }, `${campagneCount} formations possèdent des dates de début pour la campagne en cours.`);

  /** 0. On initialise parcoursup_id à null si l'information n'existe pas sur la formation */
  logger.debug({ type: "job" }, "Etape 0.");
  await Formation.updateMany({ parcoursup_id: { $exists: false } }, { $set: { parcoursup_id: null } });

  /** 1. Application de la réglementation : réinitialisation des étiquettes pour les formations qui sortent du périmètre quelque soit le statut (sauf publié, fermé, non publié) */
  logger.debug({ type: "job" }, "Etape 1.");
  await Formation.updateMany(
    {
      $or: [
        {
          parcoursup_statut: {
            $nin: [PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.FERME, PARCOURSUP_STATUS.NON_PUBLIE],
          },
          $or: [
            // Plus dans le flux
            { published: false },
            // Plus dans le catalogue général
            { catalogue_published: false, forced_published: { $ne: true } },
            // Diplôme périmé
            {
              "rncp_details.code_type_certif": {
                $in: ["Titre", "TP", null],
              },
              rncp_code: {
                $exists: true,
                $ne: null,
              },
              "rncp_details.rncp_outdated": true,
            },
            {
              "rncp_details.code_type_certif": {
                $in: ["Titre", "TP", null],
              },
              rncp_code: { $eq: null },
              cfd_outdated: true,
            },
            {
              "rncp_details.code_type_certif": {
                $nin: ["Titre", "TP", null],
              },
              cfd_outdated: true,
            },
            // Date de début hors campagne en cours.
            { date_debut: { $not: { $gte: sessionStartDate, $lt: sessionEndDate } } },
            // Sur des codes RNCPs temporairement non autorisés
            {
              rncp_code: {
                $in: excludedRNCPs,
              },
            },
          ],
        },
        // Reset du statut si l'on supprime parcoursup_id
        { parcoursup_statut: PARCOURSUP_STATUS.PUBLIE, parcoursup_id: null },
        // Initialisation du statut si non existant
        { parcoursup_statut: null },
      ],
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 2. On réinitialise les formations "à publier ..." à "non publiable en l'état" pour permettre le recalcule du périmètre */
  logger.debug({ type: "job" }, "Etape 2.");
  await Formation.updateMany(
    {
      parcoursup_statut: {
        $in: [
          PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
          PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
          PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
          PARCOURSUP_STATUS.A_PUBLIER,
        ],
      },
    },
    { $set: { parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT } }
  );

  /** 3. On applique les règles de périmètres pour statut "à publier avec action attendue" uniquement sur les formations "non publiable en l'état" pour ne pas écraser les actions menées par les utilisateurs */
  logger.debug({ type: "job" }, "Etape 3.");
  const filterNonPubliable = {
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  };

  const aPublierSousConditions = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: {
      $in: [
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      ],
    },
    is_deleted: { $ne: true },
  }).lean();

  aPublierSousConditions.length > 0 &&
    (await asyncForEach(aPublierSousConditions, async (rule) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterSessionDate,
          ...filterNonPubliable,

          ...getQueryFromRule(rule, true),
        },
        [
          {
            $set: {
              last_update_at: Date.now(),
              parcoursup_statut: rule.statut,
            },
          },
        ]
      );
    }));

  /** 4. Enfin on applique les règles appliquant le statut "à publier" sur toutes les formations (y compris celles qui correspondent aux règles précédentes) */
  logger.debug({ type: "job" }, "Etape 4.");
  const filter = {
    parcoursup_statut: {
      $in: [
        PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
        PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
        PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
        PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
      ],
    },
  };

  const aPublierRules = await ReglePerimetre.find({
    plateforme: "parcoursup",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    is_deleted: { $ne: true },
  }).lean();

  aPublierRules.length > 0 &&
    (await Formation.updateMany(
      {
        ...filterReglement,
        ...filterSessionDate,
        ...filter,

        $or: aPublierRules.map((rule) => getQueryFromRule(rule, true)),
      },
      [
        {
          $set: {
            last_update_at: Date.now(),
            parcoursup_statut: {
              $cond: {
                if: {
                  $eq: ["$parcoursup_id", null],
                },
                then: PARCOURSUP_STATUS.A_PUBLIER,
                else: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
              },
            },
          },
        },
      ]
    ));

  /** 5. On applique les règles des académies */
  // logger.debug({ type: "job" }, "Etape 5.");
  // const academieRules = [...aPublierSousConditions, ...aPublierRules].filter(
  //   ({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0
  // );

  // await asyncForEach(academieRules, async (rule) => {
  //   await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
  //     logger.debug({ type: "job" }, status);
  //     await Formation.updateMany(
  //       {
  //         ...filterReglement,
  //         ...filterSessionDate,

  //         parcoursup_statut: {
  //           $in: [
  //             PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  //             PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  //             PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
  //             PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
  //             PARCOURSUP_STATUS.A_PUBLIER,
  //           ],
  //         },

  //         num_academie,
  //         ...getQueryFromRule(rule, true),
  //       },
  //       [
  //         {
  //           $set: {
  //             last_update_at: Date.now(),
  //             parcoursup_statut: {
  //               $cond: {
  //                 if: {
  //                   $eq: ["$parcoursup_id", null],
  //                 },
  //                 then: status,
  //                 else:
  //                   status === PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT
  //                     ? PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT
  //                     : status === PARCOURSUP_STATUS.A_PUBLIER
  //                       ? PARCOURSUP_STATUS.PRET_POUR_INTEGRATION
  //                       : status,
  //               },
  //             },
  //           },
  //         },
  //       ]
  //     );
  //   });
  // });

  /** 6. Vérification de la date de publication */
  logger.debug({ type: "job" }, "Etape 6.");
  /** 6a. On s'assure que les dates de publication soient définies pour les formations publiées */
  await Formation.updateMany(
    {
      parcoursup_published_date: null,
      parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    },
    { $set: { parcoursup_published_date: new Date() } }
  );

  /** 6b. On s'assure que les dates de publication ne soient pas définies pour les formations non publiées */
  await Formation.updateMany(
    {
      parcoursup_published_date: { $ne: null },
      parcoursup_statut: { $ne: PARCOURSUP_STATUS.PUBLIE },
    },
    { $set: { parcoursup_published_date: null } }
  );

  /** 7. On met à jour l'historique des statuts. */
  logger.debug({ type: "job" }, "Etape 7.");
  await updateManyTagsHistory("parcoursup_statut");
};

module.exports = { run };
