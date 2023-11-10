const { Formation } = require("../../../common/model");
const logger = require("../../../common/logger");
const { AFFELNET_STATUS } = require("../../../constants/status");

/**
 * Si l'historique contient des affelnet_statut différents de "en attente de publication" après la date, cela signifie que la formation n'est pas "en attente de publication" depuis la date spécifiée
 *
 * @param {*} formation
 * @param {Date} date
 * @returns
 */
const allHistoryIsEnAttenteAfterDate = (formation, date) => {
  return formation.updates_history
    ?.filter((history) => new Date(history.updated_at) >= new Date(date))
    ?.every((history) => !history.to?.affelnet_statut || history.to?.affelnet_statut === AFFELNET_STATUS.EN_ATTENTE);
};

/**
 * Si l'historique contenant une modification de affelnet_statut juste avant la date est différente de "en attente de publication", cela signifie qu'il y a eu un changement de status après la date spécifiée
 *
 * @param {*} formation
 * @param {Date} date
 * @returns
 */
const lastHistoryIsEnAttenteBeforeDate = (formation, date) =>
  formation.updates_history
    ?.filter((history) => !!history.to.affelnet_statut)
    ?.filter((history) => new Date(history.updated_at) < new Date(date))
    ?.reverse()[0]?.to.affelnet_statut === AFFELNET_STATUS.EN_ATTENTE;

/**
 *
 * @param {Date} date La date à partir de laquelle les formations ayant été passées au statut Affelnet "en attente de publication" vont repassé à "non intégrable".
 */
const run = async (date) => {
  let count = 0;

  const query = {
    published: true,
    affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
  };

  const totalBefore = await Formation.countDocuments(query);

  console.info(`> ${totalBefore} formations '${AFFELNET_STATUS.EN_ATTENTE}' sur Affelnet`);

  const cursor = await Formation.find(query).cursor();

  for await (const formation of cursor) {
    if (allHistoryIsEnAttenteAfterDate(formation, date) && lastHistoryIsEnAttenteBeforeDate(formation, date)) {
      try {
        console.error(formation._id);
        await Formation.updateOne(
          { _id: formation._id },
          {
            $set: {
              affelnet_statut: AFFELNET_STATUS.NON_INTEGRABLE,
            },
            $push: {
              affelnet_statut_history: { affelnet_statut: AFFELNET_STATUS.NON_INTEGRABLE, date: new Date() },
              updates_history: {
                from: { affelnet_statut: formation.affelnet_statut },
                to: { affelnet_statut: AFFELNET_STATUS.NON_INTEGRABLE },
                updated_at: new Date(),
              },
            },
          }
        );

        if (++count % 10 === 0) {
          console.info(`> ${count} status Affelnet mis à jour.`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  console.info(`> ${count} status Affelnet mis à jour.`);

  const totalAfter = await Formation.countDocuments(query);

  logger.info({ type: "job" }, `Total formations réinitialisées dans le catalogue : ${totalAfter}/${totalBefore}\n`);
};

module.exports = {
  run,
  allHistoryIsEnAttenteAfterDate,
  lastHistoryIsEnAttenteBeforeDate,
};
