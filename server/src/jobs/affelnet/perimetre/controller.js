const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");

const run = async () => {
  // set "hors périmètre"
  await Formation.updateMany(
    {
      $or: [
        { affelnet_statut: null },
        { catalogue_published: false, forced_published: { $ne: true } },
        { published: false },
        {
          $or: [
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
          ],
        },
      ],
    },
    { $set: { affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE } }
  );

  // set "à publier (soumis à validation)" for trainings matching affelnet eligibility rules
  // reset "à publier" & "à publier (soumis à validation)"
  await Formation.updateMany(
    {
      affelnet_statut: { $in: [AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER] },
    },
    { $set: { affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE } }
  );

  // run only on those 'hors périmètre' to not overwrite actions of users !
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
        ...filterHP,
        $or: aPublierSoumisAValidationRules.map(getQueryFromRule),
      },
      {
        $set: {
          last_update_at: Date.now(),
          affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
        },
      }
    );
  }

  //  set "à publier" for trainings matching affelnet eligibility rules
  // run only on those "hors périmètre" & "à publier (soumis à validation)" to not overwrite actions of users !
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
        ...filter,
        $or: aPublierRules.map(getQueryFromRule),
      },
      {
        $set: {
          last_update_at: Date.now(),
          affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
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
          affelnet_statut: {
            $in: [AFFELNET_STATUS.HORS_PERIMETRE, AFFELNET_STATUS.A_PUBLIER_VALIDATION, AFFELNET_STATUS.A_PUBLIER],
          },
          num_academie,
          ...getQueryFromRule(rule),
        },
        { $set: { last_update_at: Date.now(), affelnet_statut: status } }
      );
    });
  });

  // ensure published date is set
  await Formation.updateMany(
    {
      affelnet_published_date: null,
      affelnet_statut: AFFELNET_STATUS.PUBLIE,
    },
    { $set: { affelnet_published_date: Date.now() } }
  );

  // ensure published date is not set
  await Formation.updateMany(
    {
      affelnet_published_date: { $ne: null },
      affelnet_statut: { $ne: AFFELNET_STATUS.PUBLIE },
    },
    { $set: { affelnet_published_date: null } }
  );

  // Push entry in tags history
  await updateTagsHistory("affelnet_statut");

  // stats
  const totalPublished = await Formation.countDocuments({ published: true });
  const totalNotRelevant = await Formation.countDocuments({
    published: true,
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
  });
  const totalToValidate = await Formation.countDocuments({
    published: true,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  });
  const totalToCheck = await Formation.countDocuments({
    published: true,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
  });
  const totalPending = await Formation.countDocuments({
    published: true,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });
  const totalAfPublished = await Formation.countDocuments({
    published: true,
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
  });
  const totalAfNotPublished = await Formation.countDocuments({
    published: true,
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
  });

  logger.info(
    `Total formations publiées dans le catalogue : ${totalPublished}\n` +
      `Total formations hors périmètre : ${totalNotRelevant}/${totalPublished}\n` +
      `Total formations à publier (soumis à validation) : ${totalToValidate}/${totalPublished}\n` +
      `Total formations à publier : ${totalToCheck}/${totalPublished}\n` +
      `Total formations en attente de publication : ${totalPending}/${totalPublished}\n` +
      `Total formations publiées sur Affelnet : ${totalAfPublished}/${totalPublished}\n` +
      `Total formations NON publiées sur Affelnet : ${totalAfNotPublished}/${totalPublished}`
  );
};

module.exports = { run };
