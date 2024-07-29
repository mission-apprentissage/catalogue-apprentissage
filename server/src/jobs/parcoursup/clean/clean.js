const { Formation, ParcoursupFormationCheck } = require("../../../common/models");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { writeData, oleoduc } = require("oleoduc");
const { PARCOURSUP_STATUS } = require("../../../constants/status");

/**
 *
 * @param {Object} args
 * @param {boolean} args.proceed
 * @returns
 */
const run = async ({ proceed }) => {
  const map = new Map();

  logger.info({ type: "job" }, `${await ParcoursupFormationCheck.countDocuments()} formations dans la base Parcoursup`);

  logger.info(
    { type: "job" },
    `${await ParcoursupFormationCheck.countDocuments({ id_rco: { $ne: null } })} possédant une clé ME`
  );

  logger.info(
    { type: "job" },
    `${await Formation.countDocuments({ parcoursup_id: { $ne: null } })} formations dans la base catalogue possédant un parcoursup_id`
  );

  try {
    await oleoduc(
      ParcoursupFormationCheck.find().cursor(),
      writeData(
        async (parcoursupFormation) => {
          if (!parcoursupFormation.id_rco) {
            logger.warn(
              { type: "job" },
              `Pas de clé ME pour la formation ${parcoursupFormation.codeformationinscription} dans la base Parcoursup`
            );

            return;
          }

          const level1 = {
            parcoursup_perimetre: true,
            parcoursup_id: parcoursupFormation.codeformationinscription,
            parcoursup_statut: { $ne: PARCOURSUP_STATUS.FERME },
            cle_me_remplace_par: null,
          };

          if (
            (await Formation.countDocuments(level1)) === 1 &&
            (await Formation.findOne(level1)).cle_ministere_educatif === parcoursupFormation.id_rco
          ) {
            logger.info(
              { type: "job" },
              `Match unique de niveau 1 : ${parcoursupFormation.codeformationinscription} > ${parcoursupFormation.id_rco}`
            );
            map.set(parcoursupFormation.codeformationinscription, [parcoursupFormation.id_rco]);
            return;
          }

          const notBtsAOptionsFilter = {
            cfd: {
              $nin: [
                "32033422",
                "32033423",
                "32033424",
                "32033425",
                "32022316",
                "32022317",
                "32022318",
                "32032209",
                "32032210",
                "32032211",
                "32032612",
                "32032613",
                "32032614",
                "32022310",
                "32022311",
                "32022312",
                "32033608",
                "32033609",
                "32033610",
                "32033611",
              ],
            },
          };

          const level2 = {
            ...level1,
            ...notBtsAOptionsFilter,
          };

          if ((await Formation.countDocuments(level2)) === 1) {
            const cle_me = (await Formation.findOne(level2)).cle_ministere_educatif;

            logger.info(
              { type: "job" },
              `Match unique de niveau 2 : ${parcoursupFormation.codeformationinscription} > ${cle_me}`
            );

            map.set(parcoursupFormation.codeformationinscription, [cle_me]);
            return;
          }

          const level3 = {
            ...level2,
            annee: "1",
          };

          if ((await Formation.countDocuments(level3)) === 1) {
            const cle_me = (await Formation.findOne(level3)).cle_ministere_educatif;

            logger.info(
              { type: "job" },
              `Match unique de niveau 3 : ${parcoursupFormation.codeformationinscription} > ${cle_me}`
            );

            map.set(parcoursupFormation.codeformationinscription, [cle_me]);
            return;
          }

          const level4 = {
            ...level3,
            published: true,
          };

          if ((await Formation.countDocuments(level4)) === 1) {
            const cle_me = (await Formation.findOne(level4)).cle_ministere_educatif;

            logger.info(
              { type: "job" },
              `Match unique de niveau 4 : ${parcoursupFormation.codeformationinscription} > ${cle_me}`
            );

            map.set(parcoursupFormation.codeformationinscription, [cle_me]);
            return;
          }

          const level5 = {
            ...level4,
            parcoursup_session: true,
          };

          if ((await Formation.countDocuments(level5)) === 1) {
            const cle_me = (await Formation.findOne(level5)).cle_ministere_educatif;

            logger.info(
              { type: "job" },
              `Match unique de niveau 5 : ${parcoursupFormation.codeformationinscription} > ${cle_me}`
            );

            map.set(parcoursupFormation.codeformationinscription, [cle_me]);
            return;
          }

          const btsAOptionFilter = {
            cfd: {
              $in: [
                "32033422",
                "32033423",
                "32033424",
                "32033425",
                "32022316",
                "32022317",
                "32022318",
                "32032209",
                "32032210",
                "32032211",
                "32032612",
                "32032613",
                "32032614",
                "32022310",
                "32022311",
                "32022312",
                "32033608",
                "32033609",
                "32033610",
                "32033611",
              ],
            },
          };

          const level6 = {
            ...level1,
            ...btsAOptionFilter,
          };

          if (await Formation.countDocuments(level6)) {
            const cles = (await Formation.find(level6)).map((formation) => formation.cle_ministere_educatif);

            logger.info(
              { type: "job" },
              `Match multiple de niveau 6 : ${parcoursupFormation.codeformationinscription} > ${cles.join(", ")}`
            );
            map.set(parcoursupFormation.codeformationinscription, cles);
            return;
          }

          logger.error(
            { type: "job" },
            `Pas de match : ${parcoursupFormation.codeformationinscription} > ${parcoursupFormation.id_rco} `
          );
        },
        { parallel: 10 }
      )
    );

    logger.info({ type: "job" }, `${[...map.keys()].length} parcoursup_id uniques`);
    logger.info({ type: "job" }, `${[...map.values()].flatMap((value) => value).length} clé ME`);

    logger.info(
      { type: "job" },
      `${await Formation.countDocuments({ parcoursup_id: { $ne: null } })} formations possédant un parcoursup_id`
    );

    logger.info(
      { type: "job" },
      `${await Formation.countDocuments({ parcoursup_id: { $ne: null, $nin: [...map.keys()] } })} formations possédant un parcoursup_id non retenu`
    );

    logger.info(
      { type: "job" },
      `${await Formation.countDocuments({
        parcoursup_id: {
          $ne: null,
        },
        $or: [...map.entries()].map(([key, value]) => ({ parcoursup_id: key, cle_ministere_educatif: { $in: value } })),
      })} formations possédant déjà le parcoursup_id retenu`
    );

    logger.info(
      { type: "job" },
      `${await Formation.countDocuments({
        $or: [...map.entries()].map(([key, value]) => ({
          parcoursup_id: { $ne: key },
          cle_ministere_educatif: { $in: value },
        })),
      })} formations ne possédant pas le parcoursup_id retenu et devant être ajouté ou mis à jour`
    );

    logger.info(
      { type: "job" },
      `${await Formation.countDocuments({ parcoursup_id: { $ne: null }, cle_ministere_educatif: { $nin: [...map.values()].flatMap((value) => value) } })} formations possédant un parcoursup_id devant être supprimé`
    );

    switch (proceed) {
      case true:
        logger.info({ type: "job" }, "Proceeding to clean...");
        await Formation.updateMany(
          {
            parcoursup_id: {
              $ne: null,
            },
            cle_ministere_educatif: { $nin: [...map.values()].flatMap((value) => value) },
          },
          {
            $set: {
              parcoursup_id: null,
            },
          }
        );

        await Promise.all(
          [...map.entries()].map(
            async ([key, value]) =>
              await Formation.updateMany(
                {
                  cle_ministere_educatif: { $in: value },
                },
                {
                  $set: {
                    parcoursup_id: key,
                  },
                }
              )
          )
        );

        break;
      default:
        logger.info({ type: "job" }, "To proceed, pass --proceed as argument");
        return;
    }
  } catch (error) {
    logger.error({ type: "job" }, error);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info({ type: "job" }, " -- Start formation parcoursup_id clean -- ");
    const args = process.argv.slice(2);
    const proceed = !!args.find((arg) => arg.startsWith("--proceed"));

    await run({ proceed });

    logger.info({ type: "job" }, " -- End formation parcoursup_id clean -- ");
  });
}
