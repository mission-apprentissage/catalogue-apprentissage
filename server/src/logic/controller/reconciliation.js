const { Formation } = require("../../common/models");
const { AFFELNET_STATUS } = require("../../constants/status");

/**
 *
 * @param {Object} formationAffelnet
 * @param {Object} match
 * @param {boolean} eraseInformations
 */
async function reconciliationAffelnet(
  { code_nature, etablissement_type, code_mef, informations, code_offre, academie },
  { cle_ministere_educatif },
  eraseInformations = false
) {
  // pass through some data for Affelnet
  const formation = await Formation.findOne(
    { cle_ministere_educatif, affelnet_id: null },
    {
      affelnet_infos_offre: 1,
      bcn_mefs_10: 1,
      affelnet_statut: 1,
    }
  ).lean();
  if (formation) {
    const update = {};
    update.affelnet_id = `${academie}/${code_offre}`;
    update.affelnet_code_nature = code_nature;
    update.affelnet_secteur = etablissement_type === "Public" ? "PU" : "PR";

    // pre-fill affelnet_infos_offre with data from affelnet import if empty (to not erase user change)
    update.affelnet_infos_offre = eraseInformations ? informations : formation.affelnet_infos_offre || informations;

    const affelnet_mefs_10 = formation.bcn_mefs_10 ?? [];
    const mef = affelnet_mefs_10.find(({ mef10 }) => mef10 === code_mef.substring(0, 10));
    if (mef) {
      update.affelnet_mefs_10 = [mef];
    } else if (!["", "AFFECTATION"].includes(code_mef)) {
      update.affelnet_mefs_10 = [
        {
          mef10: code_mef,
          modalite: {
            duree: code_mef.substring(8, 9),
            annee: code_mef.substring(9, 10),
          },
        },
      ];
    }

    if (formation.affelnet_statut !== AFFELNET_STATUS.NON_PUBLIE) {
      update.affelnet_statut = AFFELNET_STATUS.PUBLIE;
      if (!formation.affelnet_published_date) {
        formation.affelnet_published_date = new Date();
      }
    }
    update.last_update_at = Date.now();
    await Formation.findOneAndUpdate({ cle_ministere_educatif }, update);
  }
}

module.exports = { reconciliationAffelnet };
