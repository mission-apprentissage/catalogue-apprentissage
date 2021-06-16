const { formation: formatFormation, etablissement: formatEtablissement } = require("./formater");
const { ConvertedFormation, Etablissement } = require("../../common/model");
const mongoose = require("mongoose");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { psRules } = require("./queries");

const getMatch = async (query) => ConvertedFormation.find(query, formatFormation).lean();

async function getParcoursupCoverage(formation, { published, tags } = {}) {
  let params = { published, tags };

  let match = null;

  for (let i = 0; i < psRules.length; i++) {
    let { query, strength } = psRules[i];

    let result = await getMatch({ ...query(formation), ...params });

    // console.log({ type: "PsRules", query: query(formation), result: result.length });

    if (result.length > 0) {
      match = {
        matching_strength: strength,
        data_length: result.length,
        data: result,
      };

      break;
    }
  }

  return match;
}

/**
 * Matching avec les formations du catalogue (Affelnet vs RCO)
 *
 * m1 = cfd
 * m2 = cfd + departement
 * m3 = cfd + departement + uai
 * m4 = cfd + departement + code postal
 * m5 = cfd + departement + code postal + uai
 */
async function getAffelnetCoverage({ code_postal: cp, code_cfd, uai }) {
  const dept = cp.substring(0, 2);
  const deptArr = dept === "20" ? ["2A", "2B"] : [dept];

  const m1 = await getMatch({ cfd: code_cfd, published: true });

  const m2 = m1.filter(({ num_departement }) => deptArr.includes(num_departement));

  const m3 = m2.filter(({ uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai }) => {
    return [uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai].includes(uai);
  });

  // m4 is alternative filtering than m3 (not based on m3 but m2)
  const m4 = m2.filter(
    ({
      etablissement_formateur_code_postal,
      etablissement_gestionnaire_code_postal,
      etablissement_formateur_code_commune_insee,
      etablissement_gestionnaire_code_commune_insee,
      code_commune_insee,
      code_postal,
    }) => {
      return [
        etablissement_formateur_code_postal,
        etablissement_gestionnaire_code_postal,
        etablissement_formateur_code_commune_insee,
        etablissement_gestionnaire_code_commune_insee,
        code_commune_insee,
        code_postal,
      ].includes(cp);
    }
  );

  const m5 = m4.filter(({ uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai }) => {
    return [uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai].includes(uai);
  });

  if (m5.length > 0) {
    return {
      strength: "5",
      matching: m5,
    };
  }

  if (m4.length > 0) {
    return {
      strength: "4",
      matching: m4,
    };
  }

  if (m3.length > 0) {
    return {
      strength: "3",
      matching: m3,
    };
  }

  if (m2.length > 0) {
    return {
      strength: "2",
      matching: m2,
    };
  }

  if (m1.length > 0) {
    return {
      strength: "1",
      matching: m1,
    };
  }

  return null;
}

const getEtablissementById = async (id) => await Etablissement.findById(id, formatEtablissement).lean();
const getEtablissements = async (query) => await Etablissement.find(query, formatEtablissement).lean();

async function getEtablissementCoverage(formations) {
  let match = [];

  await asyncForEach(
    formations,
    async ({
      uai_formation,
      etablissement_formateur_uai,
      etablissement_gestionnaire_uai,
      etablissement_formateur_id,
      etablissement_gestionnaire_id,
    }) => {
      if (!uai_formation && !etablissement_formateur_uai && !etablissement_gestionnaire_uai) {
        if (etablissement_formateur_id) {
          let formateur = await getEtablissementById(etablissement_formateur_id);

          if (formateur) {
            match.push({ ...formateur, matched_uai: "BY_ID_FORMATEUR", id_mna_etablissement: formateur._id });
          }
        }
        if (etablissement_gestionnaire_id) {
          let gestionnaire = await getEtablissementById(etablissement_gestionnaire_id);

          if (gestionnaire) {
            match.push({ ...gestionnaire, matched_uai: "BY_ID_GESTIONNAIRE", id_mna_etablissement: gestionnaire._id });
          }
        }
        return;
      }

      let exist = match.find(
        (x) =>
          x.uai === uai_formation || x.uai === etablissement_formateur_uai || x.uai === etablissement_gestionnaire_uai
      );

      if (exist) return;

      if (uai_formation) {
        let resuai = await getEtablissements({ uai: uai_formation });

        if (resuai.length > 0) {
          resuai.forEach((x) => {
            match.push({ ...x, matched_uai: "UAI_FORMATION", id_mna_etablissement: x._id });
          });
        }
      }

      if (etablissement_formateur_uai) {
        let resformateur = await getEtablissements({ uai: etablissement_formateur_uai });

        if (resformateur.length > 0) {
          resformateur.forEach((x) => {
            match.push({ ...x, matched_uai: "UAI_FORMATEUR", id_mna_etablissement: x._id });
          });
        }
      }

      if (etablissement_gestionnaire_uai) {
        let resgestionnaire = await getEtablissements({ uai: etablissement_gestionnaire_uai });

        if (resgestionnaire.length > 0) {
          resgestionnaire.forEach((x) => {
            match.push({ ...x, matched_uai: "UAI_GESTIONNAIRE", id_mna_etablissement: x._id });
          });
        }
      }
    }
  );

  if (match.length === 0) return null;

  const format = match.reduce((acc, item) => {
    if (!acc[item.id_mna_etablissement]) {
      acc[item.id_mna_etablissement] = item;
      acc[item.id_mna_etablissement].matched_uai = [acc[item.id_mna_etablissement].matched_uai];
    } else {
      const exist = acc[item.id_mna_etablissement].matched_uai.includes(item.matched_uai);
      if (acc[item.id_mna_etablissement].matched_uai !== item.matched_uai) {
        if (!exist) {
          acc[item.id_mna_etablissement].matched_uai = acc[item.id_mna_etablissement].matched_uai.concat([
            item.matched_uai,
          ]);
        }
      }
    }
    return acc;
  }, {});

  const etablissements = Object.values(format).map((x) => {
    return {
      _id: new mongoose.Types.ObjectId(),
      ...x,
    };
  });

  return etablissements;
}

module.exports = { getParcoursupCoverage, getAffelnetCoverage, getEtablissementCoverage };
