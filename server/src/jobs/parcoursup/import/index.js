const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const { buildUpdatesHistory } = require("../../../logic/common/utils/diffUtils");
const { runScript } = require("../../scriptWrapper");
const { getFormations } = require("../parcoursupApi");

const STATUS = {
  NOTHING_TODO: "Aucune donnée à mettre à jour",
  CANCELED_PUBLICATION: "Publication annulée suite à suppression de la formation dans Parcoursup",
  NEW_LINK: "Clé ME ajoutée manuellement dans Parcoursup",
  CLOSED: "Formation déclarée fermée dans Parcoursup",
};

/**
 * Import quotidien des formations PSUP pour comparaison des bases
 */
const psImport = async () => {
  try {
    const results = await getFormations();

    console.log(
      results
        .filter(({ status }) => status === STATUS.NEW_LINK)
        .map(({ g_ta_cod: parcoursup_id, status, rco: cle_ministere_educatif }) => ({
          parcoursup_id,
          status,
          cle_ministere_educatif,
        }))
    );

    const statusesCount = results.reduce(function (prev, cur) {
      prev[cur.status] = (prev[cur.status] || 0) + 1;
      return prev;
    }, {});

    let closed = 0,
      linked = 0,
      canceled = 0;

    console.log(statusesCount);

    for (const { g_ta_cod: parcoursup_id, status, rco: cle_ministere_educatif } of results) {
      const date = new Date();

      switch (status) {
        case STATUS.CANCELED_PUBLICATION: {
          const canceledFormations = await Formation.find({
            $or: [{ cle_ministere_educatif }, { parcoursup_id }],
            parcoursup_id: { $ne: null },
          });
          const update = { parcoursup_id: null, last_update_at: date, last_update_who: "Parcoursup" };

          canceledFormations.forEach(async (canceledFormation) => {
            console.log(`canceled : ${canceledFormation.cle_ministere_educatif}`);

            canceledFormation &&
              (canceled += (
                await Formation.updateOne(
                  { cle_ministere_educatif: canceledFormation.cle_ministere_educatif },
                  {
                    ...update,
                    $push: {
                      updates_history: buildUpdatesHistory(canceledFormation, update, [
                        "last_update_at",
                        "last_update_who",
                        "parcoursup_id",
                      ]),
                    },
                  }
                )
              ).nModified);
          });

          break;
        }

        case STATUS.NEW_LINK: {
          const newLinkFormations = await Formation.find({
            cle_ministere_educatif,
          });
          const update = {
            parcoursup_id,
            parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
            last_update_at: date,
            last_update_who: "Parcoursup",
            rejection: {
              handled_by: null,
              handled_date: null,
            },
          };

          newLinkFormations.forEach(async (newLinkFormation) => {
            console.log(`newLink : ${newLinkFormation.cle_ministere_educatif}`);

            newLinkFormation &&
              (linked += (
                await Formation.updateOne(
                  { cle_ministere_educatif: newLinkFormation.cle_ministere_educatif },
                  {
                    ...update,
                    $push: {
                      updates_history: buildUpdatesHistory(newLinkFormation, update, [
                        "last_update_at",
                        "last_update_who",
                        "rejection.handled_by",
                        "rejection.handled_date",
                        "parcoursup_statut",
                        "parcoursup_id",
                      ]),
                    },
                  }
                )
              ).nModified);
          });
          break;
        }

        case STATUS.CLOSED: {
          const closedFormations = await Formation.find({
            $and: [
              {
                $or: [{ cle_ministere_educatif }, { parcoursup_id }],
              },
              {
                $or: [{ parcoursup_statut: { $nin: [PARCOURSUP_STATUS.FERME] } }, { parcoursup_id: { $ne: null } }],
              },
            ],
          });
          const update = {
            parcoursup_id: null,
            parcoursup_statut: PARCOURSUP_STATUS.FERME,
            last_update_at: date,
            last_update_who: "Parcoursup",
          };

          closedFormations.forEach(async (closedFormation) => {
            console.log(`closed : ${closedFormation.cle_ministere_educatif}`);

            closedFormation &&
              (closed += (
                await Formation.updateOne(
                  { cle_ministere_educatif: closedFormation.cle_ministere_educatif },
                  {
                    ...update,
                    $push: {
                      updates_history: buildUpdatesHistory(closedFormation, update, [
                        "last_update_at",
                        "last_update_who",
                        "parcoursup_statut",
                        "parcoursup_id",
                      ]),
                    },
                  }
                )
              ).nModified);
          });

          break;
        }

        case STATUS.NOTHING_TODO:
        default:
          break;
      }
    }

    console.log({ closed, linked, canceled });
  } catch (error) {
    logger.error({ type: "job" }, "Parcoursup WS error", error?.response?.status, error?.response?.data ?? error);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info({ type: "job" }, " -- Start psup import -- ");

    await psImport();

    logger.info({ type: "job" }, " -- End psup import -- ");
  });
}

module.exports = {
  psImport,
};
