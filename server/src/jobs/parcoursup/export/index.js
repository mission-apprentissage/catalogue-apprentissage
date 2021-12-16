const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { Formation, User } = require("../../../common/model");
const parcoursupApi = require("./parcoursupApi");
const { findLast } = require("lodash");

const limit = Number(process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_LIMIT || 50);

const STATUS = {
  PUBLIE: "publié",
  EN_ATTENTE: "en attente de publication",
};

const filter = {
  parcoursup_statut: STATUS.EN_ATTENTE,
  uai_formation: { $ne: null },
  rncp_code: { $ne: null },
};

const select = {
  rncp_code: 1,
  cfd_entree: 1,
  uai_formation: 1,
  parcoursup_mefs_10: 1,
  rome_codes: 1,
  parcoursup_statut_history: 1,
  parcoursup_error: 1,
  updates_history: 1,
  cle_ministere_educatif: 1,
};

// Retry the ones with errors last
const sort = {
  parcoursup_error: 1,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findPublishUser = async (updates_history) => {
  const modification = findLast(updates_history, ({ to }) => {
    return to?.parcoursup_statut === STATUS.EN_ATTENTE;
  });

  if (modification?.to?.last_update_who) {
    const user = await User.findOne({ email: modification?.to?.last_update_who });
    return user?._id;
  }

  return "";
};

const formatter = async ({
  rncp_code,
  cfd_entree,
  uai_formation,
  cle_ministere_educatif,
  parcoursup_mefs_10 = [],
  rome_codes = [],
  updates_history = [],
}) => {
  const [{ mef10: mef } = { mef10: "" }] = parcoursup_mefs_10;

  return {
    user: await findPublishUser(updates_history),
    rncp: [Number(rncp_code.replace("RNCP", ""))],
    cfd: cfd_entree,
    uai: uai_formation,
    rco: cle_ministere_educatif,
    mef: parcoursup_mefs_10.length <= 1 ? mef : "",
    rome: rome_codes,
  };
};

const createCursor = (query = filter) => {
  return Formation.find(query, select).sort(sort).limit(limit).cursor();
};

const createFormation = async (formation) => {
  let data;
  try {
    data = await formatter(formation);
    const response = await parcoursupApi.postFormation(data);

    logger.info(`Parcoursup WS response: g_ta_cod=${response.g_ta_cod} dejaEnvoye=${response.dejaEnvoye}`);

    if (!response.g_ta_cod) {
      const e = new Error("Missing g_ta_cod");
      e.response = { status: 200, data: response };
      throw e;
    }

    formation.parcoursup_id = response.g_ta_cod;
    formation.parcoursup_statut = STATUS.PUBLIE;
    formation.last_update_at = Date.now();
    formation.last_update_who = "web service Parcoursup";
    formation.parcoursup_statut_history.push({
      date: new Date(),
      parcoursup_statut: STATUS.PUBLIE,
      last_update_who: "web service Parcoursup",
    });
    await formation.save();
  } catch (e) {
    logger.error("Parcoursup WS error", e?.response?.status, e?.response?.data ?? e, data);
    formation.parcoursup_error = `${e?.response?.status} ${
      e?.response?.data?.message ?? e?.response?.data ?? "erreur de création"
    }`;
    await formation.save();
  }
};

/**
 * Export quotidien des formations "en attente de publication"
 * pour création sur Parcoursup via le Web Service dédié
 */
const run = async () => {
  const args = process.argv.slice(2);
  const id = args.find((arg) => arg.startsWith("--id"))?.split("=")?.[1];
  const query = id ? { _id: id } : filter;

  let cursor = createCursor(query);
  for await (const formation of cursor) {
    await createFormation(formation);
    await sleep(10000);
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
