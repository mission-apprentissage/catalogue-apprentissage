const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { Formation, User } = require("../../../common/model");
const parcoursupApi = require("../parcoursupApi");
const { findLast } = require("lodash");
const { PARCOURSUP_STATUS } = require("../../../constants/status");
const {
  getParcoursupError,
  getParcoursupErrorAction,
  getParcoursupErrorDescription,
} = require("../../../common/utils/parcoursupUtils");

/** @typedef {import("../../../common/model/schema/formation").Formation} Formation */

const limit = Number(process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_LIMIT || 50);

const filter = {
  catalogue_published: true,
  published: true,
  parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
  uai_formation: { $ne: null },
};

const select = {
  rncp_code: 1,
  cfd_entree: 1,
  uai_formation: 1,
  parcoursup_mefs_10: 1,
  rome_codes: 1,
  parcoursup_statut_history: 1,
  parcoursup_error: 1,
  parcoursup_id: 1,
  updates_history: 1,
  cle_ministere_educatif: 1,
};

// Retry the ones with errors last
const sort = {
  parcoursup_error: 1,
  last_update_at: 1,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findPublishUser = async (updates_history) => {
  const modification = findLast(updates_history, ({ to }) => {
    return to?.parcoursup_statut === PARCOURSUP_STATUS.EN_ATTENTE;
  });

  if (modification?.to?.last_update_who) {
    const user = await User.findOne({ email: modification?.to?.last_update_who });
    return user?._id;
  }

  return "";
};

const formatter = async ({
  parcoursup_id,
  rncp_code,
  cfd_entree,
  uai_formation,
  cle_ministere_educatif,
  parcoursup_mefs_10 = [],
  updates_history = [],
}) => {
  const mefs10 = parcoursup_mefs_10 ?? [];
  const [{ mef10: mef } = { mef10: "" }] = mefs10;

  return {
    g_ta_cod: parcoursup_id ? Number(parcoursup_id) : null,
    user: await findPublishUser(updates_history),
    rncp: rncp_code ? [Number(rncp_code.replace("RNCP", ""))] : [],
    cfd: cfd_entree,
    uai: uai_formation,
    rco: cle_ministere_educatif,
    mef: mefs10.length <= 1 ? mef : "",
  };
};

const createCursor = (query = filter) => {
  return Formation.find(query, select).sort(sort).limit(limit).cursor();
};

/**
 *
 * @param {Formation} formation
 * @param {string?} email
 * @returns
 */
const createFormation = async (formation, email = null) => {
  let data;

  formation.parcoursup_export_date = new Date();

  try {
    data = await formatter(formation);

    const response = await parcoursupApi.postFormation(data);

    logger.debug(
      { type: "job" },
      `Parcoursup WS response: g_ta_cod=${response.g_ta_cod} dejaEnvoye=${response.dejaEnvoye}`
    );

    if (!response.g_ta_cod) {
      const e = new Error("Missing g_ta_cod");
      e.response = { status: 200, data: response };
      throw e;
    }

    formation.parcoursup_id = response.g_ta_cod;
    formation.parcoursup_statut = PARCOURSUP_STATUS.PUBLIE;
    formation.parcoursup_published_date = new Date();
    formation.last_statut_update_date = new Date();
    formation.last_update_at = Date.now();
    formation.last_update_who = `web service Parcoursup${email ? `, sent by ${email}` : ""}`;
    formation.parcoursup_statut_history.push({
      date: new Date(),
      parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
      last_update_who: `web service Parcoursup${email ? `, sent by ${email}` : ""}`,
    });
    formation.parcoursup_error = null;
    await formation.save({ validateBeforeSave: false });
  } catch (error) {
    // logger.error(
    //   { type: "job" },
    //   "Parcoursup WS error",
    //   error?.response?.status,
    //   error?.response?.data?.message ?? error?.response?.data ?? "erreur de création",
    //   data
    // );
    formation.last_update_at = Date.now();
    formation.last_update_who = `web service Parcoursup${email ? `, sent by ${email}` : ""}, received error`;
    formation.parcoursup_error = `${error?.response?.status} ${
      error?.response?.data?.message ?? error?.response?.data ?? "erreur de création"
    }`;

    if (getParcoursupError(formation)) {
      formation.last_statut_update_date = new Date();
      formation.parcoursup_statut = PARCOURSUP_STATUS.REJETE;
      formation.rejection = {
        error: formation.parcoursup_error,
        description: getParcoursupErrorDescription(formation),
        action: getParcoursupErrorAction(formation),
        handled_by: null,
        handled_date: null,
      };
      formation.parcoursup_statut_history.push({
        date: new Date(),
        parcoursup_statut: PARCOURSUP_STATUS.REJETE,
      });
    } else {
      logger.error({ type: "job" }, `Erreur Parcoursup non gérée : ${formation.parcoursup_error}`);
    }

    await formation.save({ validateBeforeSave: false });
  }
  return formation;
};

/**
 * Export quotidien des formations "en attente de publication"
 * pour création sur Parcoursup via le Web Service dédié
 */
const run = async () => {
  logger.info({ type: "job" }, " -- PARCOURSUP EXPORT : ⏳  -- ");
  const args = process.argv.slice(2);
  const id = args.find((arg) => arg.startsWith("--id"))?.split("=")?.[1];
  const query = id ? { _id: id } : filter;

  let cursor = createCursor(query);
  for await (const formation of cursor) {
    await createFormation(formation);
    await sleep(1000);
  }
  logger.info({ type: "job" }, " -- PARCOURSUP EXPORT : ✅  -- ");
};

if (process.env.standalone) {
  runScript(async () => {
    await run();
  });
}

module.exports = {
  createCursor,
  createFormation,
  run,
  formatter,
};
