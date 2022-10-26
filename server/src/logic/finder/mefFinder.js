const { ReglePerimetre, SandboxFormation } = require("../../common/model");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { findMefsForParcoursup } = require("../../common/utils/parcoursupUtils");
const { getQueryFromRule } = require("../../common/utils/rulesUtils");
const { AFFELNET_STATUS } = require("../../constants/status");

const findMefsForAffelnet = async (rules) => {
  const results = await SandboxFormation.find({ ...rules }, { bcn_mefs_10: 1 }).lean();

  if (results && results.length > 0) {
    return results.reduce((acc, { bcn_mefs_10 }) => {
      return [...acc, ...bcn_mefs_10];
    }, []);
  }

  return null;
};

const computeMefs = async (fields) => {
  let bcn_mefs_10 = fields.bcn_mefs_10;
  let affelnet_mefs_10 = null;
  let parcoursup_mefs_10 = null;
  let duree_incoherente = false;
  let annee_incoherente = false;

  // filter bcn_mefs_10 with data received from RCO
  const duree = fields.duree;
  if (duree && duree !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.duree === duree;
    });

    duree_incoherente =
      !!fields.bcn_mefs_10.length &&
      fields.bcn_mefs_10.every(({ modalite }) => {
        return modalite.duree !== duree;
      });
  }

  const annee = fields.annee;
  if (annee && annee !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.annee === annee;
    });

    annee_incoherente =
      !!fields.bcn_mefs_10.length &&
      fields.bcn_mefs_10.every(({ modalite }) => {
        return modalite.annee !== annee;
      });
  }

  // try to fill mefs for Affelnet
  if (bcn_mefs_10?.length > 0) {
    //  filter bcn_mefs_10 to get affelnet_mefs_10 for affelnet

    // eslint-disable-next-line no-unused-vars
    const { _id, updates_history, ...rest } = fields;

    const aPublierRules = await ReglePerimetre.find({
      plateforme: "affelnet",
      statut: AFFELNET_STATUS.A_PUBLIER,
      is_deleted: { $ne: true },
    }).lean();

    const aPublierSoumisAValidationRules = await ReglePerimetre.find({
      plateforme: "affelnet",
      statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
      is_deleted: { $ne: true },
    }).lean();

    // Split formation into N formation with 1 mef each
    // & insert theses into a tmp collection
    await asyncForEach(bcn_mefs_10, async (mefObj) => {
      await new SandboxFormation({
        ...rest,
        bcn_mefs_10: [mefObj],
      }).save({ validateBeforeSave: false });
    });

    // apply perimetre filters against the tmp collection
    // check "à publier" first to have less mefs
    // Add current cle_ministere_educatif to ensure no concurrent access in db
    let filtered_affelnet_mefs_10 = await findMefsForAffelnet({
      cle_ministere_educatif: rest.cle_ministere_educatif,
      $or: aPublierRules.map(getQueryFromRule),
    });

    if (!filtered_affelnet_mefs_10) {
      filtered_affelnet_mefs_10 = await findMefsForAffelnet({
        cle_ministere_educatif: rest.cle_ministere_educatif,
        $or: aPublierSoumisAValidationRules.map(getQueryFromRule),
      });
    }

    if (filtered_affelnet_mefs_10) {
      // keep the successful mefs in affelnet field
      affelnet_mefs_10 = filtered_affelnet_mefs_10;
    }

    await SandboxFormation.deleteMany({ cle_ministere_educatif: rest.cle_ministere_educatif });
  }

  // try to fill mefs for Parcoursup
  if (bcn_mefs_10?.length > 0) {
    parcoursup_mefs_10 = findMefsForParcoursup(fields);
  }

  return {
    bcn_mefs_10,
    affelnet_mefs_10,
    parcoursup_mefs_10,
    duree_incoherente,
    annee_incoherente,
  };
};

module.exports = { computeMefs };
