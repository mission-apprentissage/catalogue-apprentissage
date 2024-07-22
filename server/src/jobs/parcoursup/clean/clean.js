const { Formation, ParcoursupFormationCheck } = require("../../../common/model");
const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { transformData, compose, writeData, oleoduc, filterData } = require("oleoduc");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { cle_me_remplace_par } = require("../../../common/model/schema/formation/formation");
const { cle_ministere_educatif } = require("../../../common/model/schema/affelnetFormation");

/**
 * Récupère les ParcoursupFormation en base, et en partant du
 */
const run = async () => {
  const map = new Map();

  try {
    await oleoduc(
      ParcoursupFormationCheck.find().cursor(),
      writeData(
        async (parcoursupFormation) => {
          if (!parcoursupFormation.id_rco) {
            logger.warn(
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
              `Match unique de niveau 1 : ${parcoursupFormation.codeformationinscription} > ${parcoursupFormation.id_rco}`
            );
            map.set(parcoursupFormation.codeformationinscription, [parcoursupFormation.id_rco]);
            return;
          }

          const level2 = {
            ...level1,
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

          if ((await Formation.countDocuments(level2)) === 1) {
            const cle_me = (await Formation.findOne(level2)).cle_ministere_educatif;

            logger.info(`Match unique de niveau 2 : ${parcoursupFormation.codeformationinscription} > ${cle_me}`);

            map.set(parcoursupFormation.codeformationinscription, [cle_me]);
            return;
          }

          const level3 = {
            ...level2,
            annee: "1",
          };

          if ((await Formation.countDocuments(level3)) === 1) {
            const cle_me = (await Formation.findOne(level3)).cle_ministere_educatif;

            logger.info(`Match unique de niveau 3 : ${parcoursupFormation.codeformationinscription} > ${cle_me}`);

            map.set(parcoursupFormation.codeformationinscription, [cle_me]);
            return;
          }

          const level4 = {
            ...level3,
            published: true,
          };

          if ((await Formation.countDocuments(level4)) === 1) {
            const cle_me = (await Formation.findOne(level4)).cle_ministere_educatif;

            logger.info(`Match unique de niveau 4 : ${parcoursupFormation.codeformationinscription} > ${cle_me}`);

            map.set(parcoursupFormation.codeformationinscription, [cle_me]);
            return;
          }

          const level5 = {
            ...level1,
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

          if (await Formation.countDocuments(level5)) {
            const cles = (await Formation.find(level5)).map((formation) => formation.cle_ministere_educatif);

            logger.info(
              `Match multiple de niveau 5 : ${parcoursupFormation.codeformationinscription} > ${cles.join(", ")}`
            );
            map.set(parcoursupFormation.codeformationinscription, cles);
            return;
          }

          logger.error(
            `Pas de match : ${parcoursupFormation.id_rco} > ${parcoursupFormation.codeformationinscription}`
          );

          try {
            // console.log({ id_rco, codeformationinscription });
            // await Formation.updateMany({ cle_ministere_educatif: { $in: cles_ministere_educatif } }, { parcoursup_id });
          } catch (err) {
            console.error(err);
          }
        },
        { parallel: 10 }
      )
    );

    // console.log(map);
    logger.info([...map].length);
    // logger.info(Array.from(map.keys()));

    logger.info(
      `${await Formation.countDocuments({ parcoursup_id: { $ne: null } })} formations possédant un parcoursup_id`
    );

    logger.info(
      `${await Formation.countDocuments({ parcoursup_id: { $ne: null, $nin: [...map.keys()] } })} formations possédant un parcoursup_id non retenu`
    );

    logger.info(
      `${await Formation.countDocuments({
        parcoursup_id: {
          $ne: null,
        },
        $or: [...map.entries()].map(([key, value]) => ({ parcoursup_id: key, cle_ministere_educatif: { $in: value } })),
      })} formations possédant un parcoursup_id retenu sur la bonne clé ministère éducative`
    );

    logger.info(
      `${await Formation.countDocuments({ parcoursup_id: { $ne: null }, cle_ministere_educatif: { $nin: [...map.values()].flatMap((value) => value) } })} formations possédant un parcoursup_id devant être supprimé`
    );

    // const deleted = await Formation.updateMany(
    //   {
    //     parcoursup_id: {
    //       $ne: null,
    //     },
    //     cle_ministere_educatif: { $nin: [...map.values()].flatMap((value) => value) },
    //   },
    //   {
    //     $set: {
    //       parcoursup_id: null,
    //     },
    //   }
    // );

    // const updated = await Promise.all(
    //   [...map.entries()].map(([key, value]) =>
    //     Formation.updateMany(
    //       {
    //         cle_ministere_educatif: { $in: value },
    //       },
    //       {
    //         $set: {
    //           parcoursup_id: key,
    //         },
    //       }
    //     )
    //   )
    // );

    console.log({ deleted, updated });
  } catch (error) {
    logger.error({ type: "job" }, error);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info({ type: "job" }, " -- Start formation parcoursup_id clean -- ");

    await run();

    logger.info({ type: "job" }, " -- End formation parcoursup_id clean -- ");
  });
}
