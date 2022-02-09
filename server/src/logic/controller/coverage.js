const { formation: formatFormation, etablissement: formatEtablissement } = require("./formater");
const { Formation, Etablissement } = require("../../common/model");
const mongoose = require("mongoose");
const { asyncForEach } = require("../../common/utils/asyncUtils");

const getMatch = async (query) => Formation.find(query, formatFormation).lean();

const hasSiret = ({ etablissement_formateur_siret, etablissement_gestionnaire_siret }, sirets) => {
  return [etablissement_formateur_siret, etablissement_gestionnaire_siret].some((siret) => sirets.includes(siret));
};

const hasUai = ({ uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai }, uais) => {
  return [uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai].some((uai) => uais.includes(uai));
};

const hasPostalCode = (
  { etablissement_gestionnaire_code_postal, etablissement_formateur_code_postal, code_postal },
  codePostal
) => {
  return [etablissement_gestionnaire_code_postal, etablissement_formateur_code_postal, code_postal].includes(
    codePostal
  );
};

const hasInsee = ({ code_commune_insee }, codeInsee) => code_commune_insee === codeInsee;

const hasRncp = ({ rncp_code }, rncps) => rncps.includes(rncp_code);

const hasCfd = ({ cfd_entree }, cfds) => cfds.includes(cfd_entree);

const hasAcademy = ({ nom_academie }, academie) => nom_academie === academie;

/**
 * Rapprochements des formations Parcoursup avec les formations du catalogue (Parcoursup vs RCO)
 *
 * On prend les matchs les plus forts dans l'ordre.
 * Si on a 1 seul match, et de force 6 ou plus, on met la formation PS dans les rapprochements "Forts".
 * Si on a 3 ou moins matchs, on met la formation PS dans les rapprochements "Faibles".
 * Sinon on met la formation PS dans rapprochements "Inconnus".
 *
 * m8 = siret + uai + rncp + cfd + code insee + academie
 * m8' = siret + rncp + cfd + code insee + academie
 * m7 = siret + uai + (rncp ou cfd) + code insee + academie
 * m7' = siret + (rncp ou cfd) + code insee + academie
 * m6 = uai + code postal + rncp + cfd + code insee + academie
 * m6' = uai + code postal + (rncp ou cfd) + code insee + academie
 * m6'' = code postal + rncp + cfd + code insee + academie
 * m6''' = code postal + (rncp ou cfd) + code insee + academie
 * m5 = uai + code postal + rncp + cfd + code insee
 * m5' = uai + code postal + (rncp ou cfd) + code insee
 * m5'' = code postal + rncp + cfd + code insee
 * m5''' = code postal + (rncp ou cfd) + code insee
 * m3 = uai + (cfd ou rncp) + code insee
 * m2 =  uai + (rncp ou cfd)
 * m2' = siret + (rncp ou cfd)
 * m1 = (cfd ou rncp) + code insee
 */
async function getParcoursupCoverage(formation) {
  const sirets = [formation.siret_cerfa ?? "", formation.siret_map ?? ""];
  const uais = [
    formation.uai_affilie,
    formation.uai_gestionnaire,
    formation.uai_composante,
    formation.uai_insert_jeune ?? "",
    formation.uai_cerfa ?? "",
    formation.uai_map ?? "",
  ];

  const m0 = await getMatch({
    $or: [{ rncp_code: { $in: formation.codes_rncp_mna } }, { cfd_entree: { $in: formation.codes_cfd_mna } }],
    published: true,
  });

  // strength 1
  const m1 = m0.filter((f) => hasInsee(f, formation.code_commune_insee)); // insee + (rncp ou cfd)

  // strength 2
  const m2 = m0.filter((f) => hasSiret(f, sirets)); // siret + (rncp ou cfd)
  const m3 = m0.filter((f) => hasUai(f, uais)); // uai + (rncp ou cfd)

  // strength 3
  const m4 = m1.filter((f) => hasUai(f, uais)); // insee + uai + (rncp ou cfd)

  // strength 5
  const m5 = m1.filter((f) => hasPostalCode(f, formation.code_postal)); // code postal + insee + (rncp ou cfd)
  const m6 = m5.filter((f) => hasRncp(f, formation.codes_rncp_mna) && hasCfd(f, formation.codes_cfd_mna)); // code postal + insee + rncp + cfd
  const m7 = m5.filter((f) => hasUai(f, uais)); // uai + code postal + insee + (rncp ou cfd)
  const m8 = m6.filter((f) => hasUai(f, uais)); // uai + code postal + insee + rncp + cfd

  // strength 6
  const m9 = m5.filter((f) => hasAcademy(f, formation.nom_academie)); // academie + code postal + insee + (rncp ou cfd)
  const m10 = m6.filter((f) => hasAcademy(f, formation.nom_academie)); // academie + code postal + insee + rncp + cfd
  const m11 = m7.filter((f) => hasAcademy(f, formation.nom_academie)); // academie + uai + code postal + insee + (rncp ou cfd)
  const m12 = m8.filter((f) => hasAcademy(f, formation.nom_academie)); // academie + uai + code postal + insee + rncp + cfd

  // strength 7
  const m13 = m2.filter((f) => hasInsee(f, formation.code_commune_insee) && hasAcademy(f, formation.nom_academie)); // insee + academie +siret + (rncp ou cfd)
  const m14 = m13.filter((f) => hasUai(f, uais)); // uai + insee + academie +siret + (rncp ou cfd)

  // strength 8
  const m15 = m13.filter((f) => hasRncp(f, formation.codes_rncp_mna) && hasCfd(f, formation.codes_cfd_mna)); // insee + academie +siret + rncp + cfd
  const m16 = m14.filter((f) => hasRncp(f, formation.codes_rncp_mna) && hasCfd(f, formation.codes_cfd_mna)); // uai + insee + academie + siret + rncp + cfd

  const psMatchs = [
    {
      strength: "8",
      result: m16,
    },
    {
      strength: "8",
      result: m15,
    },
    {
      strength: "7",
      result: m14,
    },
    {
      strength: "7",
      result: m13,
    },
    {
      strength: "6",
      result: m12,
    },
    {
      strength: "6",
      result: m11,
    },
    {
      strength: "6",
      result: m10,
    },
    {
      strength: "6",
      result: m9,
    },
    {
      strength: "5",
      result: m8,
    },
    {
      strength: "5",
      result: m7,
    },
    {
      strength: "5",
      result: m6,
    },
    {
      strength: "5",
      result: m5,
    },
    {
      strength: "3",
      result: m4,
    },
    {
      strength: "2",
      result: m3,
    },
    {
      strength: "2",
      result: m2,
    },
    {
      strength: "1",
      result: m1,
    },
  ];

  let match = null;

  for (let i = 0; i < psMatchs.length; i++) {
    const { result, strength } = psMatchs[i];

    if (result.length > 0) {
      match = {
        matching_strength: strength,
        data_length: result.length,
        data: result.map(({ _id, cle_ministere_educatif, intitule_court, parcoursup_statut }) => {
          return {
            intitule_court,
            parcoursup_statut,
            _id,
            cle_ministere_educatif,
          };
        }),
      };

      break;
    }
  }

  return match;
}

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
    "bcn_mefs_10.mef10": code_mef?.substring(0, 10),
    published: true,
    niveau: { $in: ["3 (CAP...)", "4 (BAC...)"] },
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

  // m3bis is alternative filtering than m3 (not based on m2 but m1)
  const m3bis = m1.filter(({ uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai }) => {
    return [uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai].includes(uai);
  });

  const m4 = m2.filter(({ uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai }) => {
    return [uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai].includes(uai);
  });

  const m5 = m3.filter(({ uai_formation, etablissement_gestionnaire_uai, etablissement_formateur_uai }) => {
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

  if (m3bis.length > 0) {
    return {
      strength: "3",
      matching: m3bis,
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
