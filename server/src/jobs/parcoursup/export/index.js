const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model/index");
const parcoursupApi = require("./parcoursupApi");

const limit = Number(process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_LIMIT || 50);

const filter = {
  parcoursup_statut: "en attente de publication",
  uai_formation: { $ne: null },
  rncp_code: { $ne: null },
  $or: [{ bcn_mefs_10: { $size: 0 } }, { bcn_mefs_10: { $size: 1 } }],
};

const select = {
  rncp_code: 1,
  cfd_entree: 1,
  uai_formation: 1,
  id_rco_formation: 1,
  bcn_mefs_10: 1,
  rome_codes: 1,
  parcoursup_statut_history: 1,
  parcoursup_error: 1,
};

// Retry the ones with errors last
const sort = {
  parcoursup_error: 1,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const formatter = ({ rncp_code, cfd_entree, uai_formation, id_rco_formation, bcn_mefs_10 = [], rome_codes = [] }) => {
  const [{ mef10: mef } = { mef10: "" }] = bcn_mefs_10;

  return {
    rncp: [Number(rncp_code.replace("RNCP", ""))],
    cfd: cfd_entree,
    uai: uai_formation,
    rco: id_rco_formation, // TODO send cle_ministere_educatif
    mef,
    rome: rome_codes,
  };
};

const createCursor = () => {
  return Formation.find(filter, select).sort(sort).limit(limit).cursor();
};

const createFormation = async (formation) => {
  try {
    const data = formatter(formation);
    const { g_ta_cod, dejaEnvoye } = await parcoursupApi.postFormation(data);

    logger.info("Parcoursup WS response", g_ta_cod, dejaEnvoye);
    formation.parcoursup_id = g_ta_cod;
    formation.parcoursup_statut = "publié";
    formation.last_update_at = Date.now();
    formation.last_update_who = "web service Parcoursup";
    formation.parcoursup_statut_history.push({
      date: new Date(),
      parcoursup_statut: "publié",
      last_update_who: "web service Parcoursup",
    });
    await formation.save();
  } catch (e) {
    logger.error("Parcoursup WS error", e?.response?.data ?? e);
    formation.parcoursup_error = e?.response?.data?.message || "erreur de création";
    await formation.save();
  }
};

/**
 * Export quotidien des formations "en attente de publication"
 * pour création sur Parcoursup via le Web Service dédié
 */
const run = async () => {
  let cursor = createCursor();
  for await (const formation of cursor) {
    await createFormation(formation);
    await sleep(500);
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start psup export -- ");

    await run();

    logger.info(" -- End psup export -- ");
  });
}

module.exports = {
  createCursor,
  createFormation,
  run,
  formatter,
};
