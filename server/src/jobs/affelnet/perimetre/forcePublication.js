const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getQueryFromRule } = require("../../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../../common/model");
const { updateTagsHistory } = require("../../../logic/updaters/tagsHistoryUpdater");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { AFFELNET_STATUS } = require("../../../constants/status");
const { runScript } = require("../../scriptWrapper");

const run = async ({ siret }) => {
  if (!siret) {
    console.info("Veuillez fournir un siret");
  }

  const defaultQuery = { etablissement_gestionnaire_siret: siret };

  // set "hors périmètre"
  await Formation.updateMany(
    {
      ...defaultQuery,
      $or: [
        { affelnet_statut: null },
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
      ...defaultQuery,
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
        ...defaultQuery,
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
        ...defaultQuery,
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
          ...defaultQuery,
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

  // Push entry in tags history
  await updateTagsHistory("affelnet_statut");

  // stats
  const totalPublished = await Formation.countDocuments({
    ...defaultQuery,
    published: true,
  });
  const totalNotRelevant = await Formation.countDocuments({
    ...defaultQuery,
    published: true,
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
  });
  const totalToValidate = await Formation.countDocuments({
    ...defaultQuery,
    published: true,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
  });
  const totalToCheck = await Formation.countDocuments({
    ...defaultQuery,
    published: true,
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
  });
  const totalPending = await Formation.countDocuments({
    ...defaultQuery,
    published: true,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });
  const totalAfPublished = await Formation.countDocuments({
    ...defaultQuery,
    published: true,
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
  });
  const totalAfNotPublished = await Formation.countDocuments({
    ...defaultQuery,
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

  logger.info(`Mise en attente de publication des formations éligibles.`);

  await Formation.updateMany(
    {
      ...defaultQuery,
      published: true,
      affelnet_statut: { $nin: [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.NON_PUBLIE, AFFELNET_STATUS.HORS_PERIMETRE] },
    },
    [{ $set: { affelnet_statut: AFFELNET_STATUS.EN_ATTENTE } }]
  );

  const newTotalPending = await Formation.countDocuments({
    ...defaultQuery,
    published: true,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  });

  logger.info(`${newTotalPending} formations passées en attente de publication`);
};

const afForcePublication = async ({ siret }) => {
  try {
    logger.info(" -- Start affelnet force publication -- ");

    await run({ siret });

    logger.info(" -- End of affelnet force publication -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = afForcePublication;

if (process.env.standalone) {
  runScript(async () => {
    const args = process.argv.slice(2);
    const siret = args.find((arg) => arg.startsWith("--siret"))?.split("=")?.[1];
    await afForcePublication({ siret });
  });
}
