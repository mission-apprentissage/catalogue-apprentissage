const { Formation, ReglePerimetre } = require("../../../common/model");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { getQueryFromRule, getCampagneStartDate, getCampagneEndDate } = require("../../../common/utils/rulesUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");

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

  const campagneCount = await Formation.countDocuments(filterDateCampagne);

  console.log(`${campagneCount} formations possèdent des dates de début pour la campagne en cours.`);

  // 0. On initialise affelnet_id à null si l'information n'existe pas sur la formation
  console.log("Etape 0.");
  await Formation.updateMany({ affelnet_id: { $exists: false } }, { $set: { affelnet_id: null } });

  // 1. Application de la réglementation : réinitialisation des étiquettes pour les formations qui sortent du périmètre quelque soit le statut (sauf publié pour le moment)
  console.log("Etape 1.");
  await Formation.updateMany(
    {
      $or: [
        {
          affelnet_statut: { $ne: AFFELNET_STATUS.PUBLIE },
          $or: [
            // Plus dans le flux
            { published: false },
            // Plus dans le catalogue général
            { catalogue_published: false, forced_published: { $ne: true } },
            // Diplôme périmé
            {
              "rncp_details.code_type_certif": {
                $in: ["Titre", "TP"],
              },
              "rncp_details.rncp_outdated": true,
            },
            {
              "rncp_details.code_type_certif": {
                $nin: ["Titre", "TP"],
              },
              cfd_outdated: true,
            },
            // Date de début hors campagne en cours.
            { date_debut: { $not: { $gte: next_campagne_debut, $lt: next_campagne_end } } },
          ],
        },
        // Reset du statut si l'on supprime affelnet_id
        { affelnet_statut: AFFELNET_STATUS.PUBLIE, affelnet_id: null },
        // Initialisation du statut si non existant
        { affelnet_statut: null },
      ],
    },

    { $set: { affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE } }
  );

  // set "à publier (soumis à validation)" for trainings matching affelnet eligibility rules
  // reset "à publier" & "à publier (soumis à validation)"
  console.log("Etape 2.");
  await Formation.updateMany(
    {
      affelnet_statut: { $in: [AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER] },
    },
    { $set: { affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE } }
  );
  // 3. On applique les règles de périmètres pour statut "à publier avec action attendue" uniquement sur les formations "hors périmètre" pour ne pas écraser les actions menées par les utilisateurs
  console.log("Etape 3.");

  const filterHP = {
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
  };

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
        ...filterHP,
        $or: aPublierSoumisAValidationRules.map(getQueryFromRule),
      },
      [
        {
          $set: {
            last_update_at: Date.now(),
            affelnet_statut: {
              $cond: {
                if: {
                  $eq: ["$affelnet_id", null],
                },
                then: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
                else: AFFELNET_STATUS.EN_ATTENTE,
              },
            },
          },
        },
      ]
    );
  }

  // 4. On applique les règles de périmètre pour statut "à publier" pour les formations répondant aux règles de publication sur Parcoursup.
  console.log("Etape 4.");

  const filter = {
    affelnet_statut: { $in: [AFFELNET_STATUS.HORS_PERIMETRE, AFFELNET_STATUS.A_PUBLIER_VALIDATION] },
  };

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
        ...filter,
        $or: aPublierRules.map(getQueryFromRule),
      },
      [
        {
          $set: {
            last_update_at: Date.now(),
            affelnet_statut: {
              $cond: {
                if: {
                  $eq: ["$affelnet_id", null],
                },
                then: AFFELNET_STATUS.A_PUBLIER,
                else: AFFELNET_STATUS.EN_ATTENTE,
              },
            },
          },
        },
      ]
    );
  }

  // 5. On applique les règles des académies
  console.log("Etape 5.");

  const academieRules = [...aPublierSoumisAValidationRules, ...aPublierRules].filter(
    ({ statut_academies }) => statut_academies && Object.keys(statut_academies).length > 0
  );

  await asyncForEach(academieRules, async (rule) => {
    await asyncForEach(Object.entries(rule.statut_academies), async ([num_academie, status]) => {
      await Formation.updateMany(
        {
          ...filterReglement,
          ...filterDateCampagne,

          affelnet_statut: {
            $in: [AFFELNET_STATUS.HORS_PERIMETRE, AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER],
          },

          num_academie,
          ...getQueryFromRule(rule),
        },
        [
          {
            $set: {
              last_update_at: Date.now(),
              affelnet_statut: {
                $cond: {
                  if: {
                    $eq: ["$affelnet_id", null],
                  },
                  then: status,
                  else:
                    status === AFFELNET_STATUS.HORS_PERIMETRE
                      ? AFFELNET_STATUS.HORS_PERIMETRE
                      : AFFELNET_STATUS.EN_ATTENTE,
                },
              },
            },
          },
        ]
      );
    });
  });

  console.log("Etape 6.");
  // 6a. On s'assure que les dates de publication sont définies pour les formations publiées
  await Formation.updateMany(
    {
      affelnet_published_date: null,
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    },
    { $set: { affelnet_published_date: new Date() } }
  );

  // 6b. On s'assure que les dates de publication ne sont pas définies pour les formations non publiées
  await Formation.updateMany(
    {
      affelnet_published_date: { $ne: null },
      affelnet_statut: { $ne: AFFELNET_STATUS.PUBLIE },
    },
    { $set: { affelnet_published_date: null } }
  );

  // 7. On met à jour l'historique des statuts.
  console.log("Etape 7.");
  await updateTagsHistory("affelnet_statut");
};

module.exports = { run };
