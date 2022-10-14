const { Formation } = require("../../common/model");
const { AFFELNET_STATUS } = require("../../constants/status");

async function reconciliationAffelnet(formationAffelnet, match, eraseInformations = false) {
  const { code_nature, etablissement_type, code_mef, libelle_mnemonique, code_offre, academie } = formationAffelnet;
  const { cle_ministere_educatif } = match;

  // pass through some data for Affelnet
  const formation = await Formation.findOne(
    { cle_ministere_educatif },
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
    update.affelnet_infos_offre = eraseInformations
      ? libelle_mnemonique
      : formation.affelnet_infos_offre || libelle_mnemonique;

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
        formation.affelnet_published_date = Date.now();
      }
    }
    update.last_update_at = Date.now();
    await Formation.findOneAndUpdate({ cle_ministere_educatif }, update);
  }
}

module.exports = { reconciliationAffelnet };
