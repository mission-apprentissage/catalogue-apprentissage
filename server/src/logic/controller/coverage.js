const { formation: formatFormation, etablissement: formatEtablissement } = require("./formater");
const { getCpInfo } = require("@mission-apprentissage/tco-service-node");
const { ConvertedFormation, Etablissement } = require("../../common/model");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { cfd, uai } = require("./queries");
const mongoose = require("mongoose");

async function getParcoursupCoverage(formation, tag = "2020") {
  const getMatch = (query) => ConvertedFormation.find({ ...query, tags: tag });

  let match = [];

  for (let i = 0; i < cfd.length; i++) {
    let { query, strength } = cfd[i];

    let result = await getMatch(query(formation));

    // console.log({ type: "CFD", query: query(formation), result: result.length });

    if (result.length > 0) {
      match.push({
        matching_strength: strength,
        data_length: result.length,
        data: formatFormation(result),
      });

      break;
    }
  }

  if (match.length === 0) {
    for (let i = 0; i < uai.length; i++) {
      let { query, strength } = uai[i];

      let result = await getMatch(query(formation));

      // console.log({ type: "UAI", query: query(formation), result: result.length });

      if (result.length > 0) {
        match.push({
          matching_strength: strength,
          data_length: result.length,
          data: formatFormation(result),
        });

        break;
      }
    }
  }

  if (match.length === 0) return null;

  return match;
}

async function getAffelnetCoverage(formation) {
  const match1 = (cfd) => ConvertedFormation.find({ cfd, published: true });
  const match2 = (cfd, num_departement) => ConvertedFormation.find({ cfd, num_departement, published: true });
  const match3 = (cfd, num_departement, code_postal) =>
    ConvertedFormation.find({
      cfd,
      num_departement,
      $and: [
        {
          $or: [
            { etablissement_formateur_code_postal: code_postal },
            { etablissement_gestionnaire_code_postal: code_postal },
            { code_postal },
          ],
        },
      ],
      published: true,
    });

  let { _id, code_postal, code_cfd } = formation;

  const { messages, result } = await getCpInfo(code_postal);
  let dept = code_postal.substring(0, 2);

  if (messages?.cp === "Ok" || messages?.cp === `Update: Le code ${code_postal} est un code commune insee`) {
    code_postal = result.code_postal;
  }

  const m3 = await match3(code_cfd, dept, code_postal);

  if (m3.length > 0) {
    return {
      strengh: "3",
      matching: formatFormation(m3),
      _id,
    };
  }

  const m2 = await match2(code_cfd, dept);

  if (m2.length > 0) {
    return {
      strengh: "2",
      matching: formatFormation(m2),
      _id,
    };
  }

  const m1 = await match1(code_cfd);

  if (m1.length > 0) {
    return {
      strengh: "1",
      matching: formatFormation(m1),
      _id,
    };
  }

  return null;
}

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
          let formateur = await Etablissement.findById(etablissement_formateur_id);
          match.push({ ...formatEtablissement(formateur), matched_uai: "BY_ID_FORMATEUR" });
        }
        if (etablissement_gestionnaire_id) {
          let gestionnaire = await Etablissement.findById(etablissement_gestionnaire_id);
          match.push({ ...formatEtablissement(gestionnaire), matched_uai: "BY_ID_GESTIONNAIRE" });
        }
        return;
      }

      let exist = match.find(
        (x) =>
          x.uai === uai_formation || x.uai === etablissement_formateur_uai || x.uai === etablissement_gestionnaire_uai
      );

      if (exist) return;

      if (uai_formation) {
        let resuai = await Etablissement.find({ uai: uai_formation });

        if (resuai.length > 0) {
          resuai.forEach((x) => {
            const formatted = formatEtablissement(x);
            match.push({ ...formatted, matched_uai: "UAI_FORMATION" });
          });
        }
      }

      if (etablissement_formateur_uai) {
        let resformateur = await Etablissement.find({ uai: etablissement_formateur_uai });

        if (resformateur.length > 0) {
          resformateur.forEach((x) => {
            const formatted = formatEtablissement(x);
            match.push({ ...formatted, matched_uai: "UAI_FORMATEUR" });
          });
        }
      }

      if (etablissement_gestionnaire_uai) {
        let resgestionnaire = await Etablissement.find({ uai: etablissement_gestionnaire_uai });

        if (resgestionnaire.length > 0) {
          resgestionnaire.forEach((x) => {
            const formatted = formatEtablissement(x);
            match.push({ ...formatted, matched_uai: "UAI_GESTIONNAIRE" });
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
      _id: mongoose.Types.ObjectId(),
      ...x,
    };
  });

  return etablissements;
}

module.exports = { getParcoursupCoverage, getAffelnetCoverage, getEtablissementCoverage };
