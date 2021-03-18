/* eslint-disable */

const { runScript } = require("../../scriptWrapper");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { diffFormation } = require("../../../logic/common/utils/diffUtils");
const { ConvertedFormation, PsFormation2021 } = require("../../../common/model");

runScript(async () => {
  await AnalyseDuplicate();
});

async function AnalyseDuplicate() {
  const dataset = await PsFormation2021.find({ nom_academie: "Lille", matching_mna_formation: { $size: 2 } }).lean();
  console.log(dataset.length);

  let buff = [];

  await asyncForEach(dataset, async (f) => {
    let { matching_mna_formation } = f;

    let [f1, f2] = await Promise.all([
      await ConvertedFormation.findById(matching_mna_formation[0]._id).lean(),
      await ConvertedFormation.findById(matching_mna_formation[1]._id).lean(),
    ]);

    const res = diffFormation(f1, f2);
    res.formation = {};

    delete res.created_at;
    delete res.last_update_at;

    res.formation.ids = [f1._id, f2._id];
    res.formation.matching_type = f.matching_type;

    // console.log(res);
    buff.push(res);
  });

  let classment = buff.reduce((acc, x) => {
    let field = Object.keys(x.updates).length;
    let field_labels = Object.keys(x.updates).join();

    if (!acc[field]) {
      acc[field] = {
        fields: field_labels,
        duplicates: [],
        items: 1,
      };
    }

    acc[field].items += 1;
    acc[field].duplicates.push(x.formation.ids);
    return acc;
  });

  console.log("BUFFER", classment);
}

const getSiretFromConverted = async (f) => {
  const formationMna = await ConvertedFormation.find({
    $or: [
      { etablissement_formateur_siret: f.siret_cerfa ?? "" },
      { etablissement_formateur_siret: f.siret_map ?? "" },
      { etablissement_gestionnaire_siret: f.siret_cerfa ?? "" },
    ],
    code_commune_insee: f.code_commune_insee,
    nom_academie: f.nom_academie,
    cfd: f.code_cfd,
    published: true,
    tags: "2021",
  }).lean();

  let stat = {
    converted: [],
    mna_formation_found: formationMna.length,
  };

  f.matching_mna_formation.forEach((x) => {
    let { etablissement_formateur_siret, etablissement_gestionnaire_siret, etablissement_reference_type } = x;
    let { converted } = stat;

    converted.push({
      etablissement_formateur_siret,
      etablissement_gestionnaire_siret,
      etablissement_reference_type,
    });
  });

  console.log({
    QUERY_nbr_formation: formationMna.length,
    stat: JSON.stringify(stat, null, 4),
  });
};
