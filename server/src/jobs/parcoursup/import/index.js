const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
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

    const statusesCount = results.reduce(function (prev, cur) {
      prev[cur.status] = (prev[cur.status] || 0) + 1;
      return prev;
    }, {});

    let closed = 0,
      linked = 0,
      canceled = 0;

    console.log(statusesCount);

    for (const { g_ta_cod: parcoursup_id, status, rco: cle_ministere_educatif } of results) {
      switch (status) {
        case STATUS.CANCELED_PUBLICATION:
          (
            await Formation.updateOne(
              { cle_ministere_educatif, parcoursup_id: { $ne: null } },
              { $set: { parcoursup_id: null } }
            )
          ).nModified === 1 && canceled++;
          break;
        case STATUS.NEW_LINK:
          (
            await Formation.updateOne(
              { cle_ministere_educatif, parcoursup_id: { $ne: parcoursup_id } },
              { $set: { parcoursup_id } }
            )
          ).nModified === 1 && linked++;
          break;
        case STATUS.CLOSED:
          console.log(parcoursup_id);
          (
            await Formation.updateOne(
              {
                cle_ministere_educatif,
                $or: [{ PARCOURSUP_STATUS: { $ne: PARCOURSUP_STATUS.FERME } }, { parcoursup_id: { $ne: null } }],
              },
              { $set: { parcoursup_id: null, parcoursup_statut: PARCOURSUP_STATUS.FERME, last_update_at: Date.now() } }
            )
          ).nModified === 1 && closed++;
          break;
        case STATUS.NOTHING_TODO:
        default:
          break;
      }
    }

    console.log({ closed, linked, canceled });
  } catch (e) {
    logger.error("Parcoursup WS error", e?.response?.status, e?.response?.data ?? e);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start psup import -- ");

    await psImport();

    logger.info(" -- End psup import -- ");
  });
}

module.exports = {
  psImport,
};
