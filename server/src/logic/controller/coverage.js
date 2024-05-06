const { formation: formatFormation, etablissement: formatEtablissement } = require("./formater");
const { Formation, Etablissement } = require("../../common/model");
const mongoose = require("mongoose");
const { asyncForEach } = require("../../common/utils/asyncUtils");

const getMatch = async (query) => Formation.find(query, formatFormation).lean();

const hasSiret = ({ etablissement_formateur_siret, etablissement_gestionnaire_siret }, sirets) => {
  return [etablissement_formateur_siret, etablissement_gestionnaire_siret]
    .filter((value) => !!value)
    .some((siret) => sirets.includes(siret));
};

const hasUai = ({ uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai }, uais) => {
  return [uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai]
    .filter((value) => !!value)
    .some((uai) => uais.includes(uai));
};

const hasPostalCode = (
  { etablissement_gestionnaire_code_postal, etablissement_formateur_code_postal, code_postal },
  codePostal
) => {
  return [etablissement_gestionnaire_code_postal, etablissement_formateur_code_postal, code_postal]
    .filter((value) => !!value)
    .includes(codePostal);
};

const hasInsee = ({ code_commune_insee }, codeInsee) => code_commune_insee && code_commune_insee === codeInsee;

const hasRncp = ({ rncp_code }, rncps) => rncps.filter((value) => !!value).includes(rncp_code);

const hasCfd = ({ cfd_entree }, cfds) => cfds.filter((value) => !!value).includes(cfd_entree);

const hasAcademy = ({ nom_academie }, academie) => nom_academie && nom_academie === academie;

/**
 * Rapprochements des formations Affelnet avec les formations du catalogue (Affelnet vs RCO)
 * On ne regarde que dans les formations niveau 3 et 4 du catalogue.
 * On prend les matchs les plus forts dans l'ordre.
 * Puis si on trouve 1 seul match & que la formation Affelnet a 1 uai, on met le match à "publié"
 *
 * m5 = mef + departement + code postal + uai
 * m4 = mef + departement + uai
 * m3 = mef + departement + code postal
 * m3' = mef + uai
 * m2 = mef + departement
 * m1 = mef
 */
async function getAffelnetCoverage({ code_postal: cp, code_mef, uai }) {
  const dept = cp.startsWith("97") ? cp.substring(0, 3) : cp.substring(0, 2);
  const deptArr = dept === "20" ? ["2A", "2B"] : [dept];

  const m1 = await getMatch({
    affelnet_perimetre: true,
    affelnet_session: true,
    "bcn_mefs_10.mef10": code_mef?.substring(0, 10),
    published: true,
    niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
    affelnet_id: null,
  });

  const m2 = m1.filter(({ num_departement }) => deptArr.includes(num_departement));

  const m3 = m2.filter(
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

  const m4 = m2.filter(({ uai_formation }) => {
    return [uai_formation].includes(uai);
  });

  const m4bis = m1.filter(({ uai_formation }) => {
    return [uai_formation].includes(uai);
  });

  const m5 = m3.filter(({ uai_formation }) => {
    return [uai_formation].includes(uai);
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

  if (m4bis.length > 0) {
    return {
      strength: "4",
      matching: m4bis,
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

module.exports = { getAffelnetCoverage, getEtablissementCoverage, getMatch };
