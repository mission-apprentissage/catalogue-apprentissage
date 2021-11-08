const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { Formation } = require("../../../common/model/index");
const { createParcoursupToken } = require("../../../common/utils/jwtUtils");
const axios = require("axios");

const privateKey = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY.replace(/\\n/gm, "\n");
const pwd = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_PRIVATE_KEY_PWD;
const id = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_CERTIFICATE_ID;
const limit = Number(process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_LIMIT || 50);
const endpoint = process.env.CATALOGUE_APPRENTISSAGE_PARCOURSUP_ENDPOINT;

const filter = {
  parcoursup_statut: "en attente de publication",
  uai_formation: { $ne: null },
  rncp_code: { $ne: null },
  $or: [
    {
      bcn_mefs_10: { $size: 0 },
    },
    {
      bcn_mefs_10: { $size: 1 },
    },
  ],
};

const select = {
  rncp_code: 1,
  cfd: 1,
  uai_formation: 1,
  id_rco_formation: 1,
  bcn_mefs_10: 1,
  rome_codes: 1,
};

const formatter = ({ rncp_code, cfd, uai_formation, id_rco_formation, bcn_mefs_10 = [], rome_codes = [] }) => {
  const [{ mef10: mef } = { mef10: "" }] = bcn_mefs_10;

  return {
    rncp: Number(rncp_code.replace("RNCP", "")),
    cfd,
    uai: uai_formation,
    rco: id_rco_formation,
    mef,
    rome: rome_codes,
  };
};

/**
 * Export quotidien des formations "en attente de publication"
 * pour création sur Parcoursup via le Web Service dédié
 */
const run = async () => {
  let cursor = Formation.find(filter, select).limit(limit).cursor();
  for await (const formation of cursor) {
    const data = formatter(formation);
    const token = createParcoursupToken({ data, privateKey, pwd, id });

    try {
      // const response =
      await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // TODO @EPT in case of success --> change "parcoursup_statut" to "publié" & store gta_code
    } catch (e) {
      logger.error(e);
    }
  }
};

if (process.env.standalone) {
  runScript(async () => {
    logger.info(" -- Start psup export -- ");

    await run();

    logger.info(" -- End psup export -- ");
  });
}
