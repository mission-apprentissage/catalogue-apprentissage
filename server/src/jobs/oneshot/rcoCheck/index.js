const logger = require("../../../common/logger");
const { runScript } = require("../../scriptWrapper");
const { ConvertedFormation, RcoFormation } = require("../../../common/model");

const getMismatchPipeline = (key, rcoKey) => {
  return [
    {
      $match: { published: true, [key]: { $ne: null } },
    },
    {
      $lookup: {
        from: "rcoformations",
        let: { converted_id: "$id_rco_formation", converted_key: `$${key}` },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$id_rco_formation", "$$converted_id"] },
                  { $ne: [`$${rcoKey ?? key}`, "$$converted_key"] },
                ],
              },
            },
          },
        ],
        as: "rco_doc",
      },
    },
    {
      $match: { rco_doc: { $nin: [null, []] } },
    },
    {
      $count: "total",
    },
  ];
};

const findMismatch = async (totalFormationsMna, key, rcoKey) => {
  const [{ total }] = await ConvertedFormation.aggregate(getMismatchPipeline(key, rcoKey));
  console.log(`total ${key} changés :`, total, `(${((total / totalFormationsMna) * 100).toFixed(2)}%)`);
};

runScript(async () => {
  logger.info(`Start check RCO data`);

  const totalFormationsRCO = await RcoFormation.countDocuments({ published: true });
  console.log("total formations RCO :", totalFormationsRCO);

  const totalFormationsMna = await ConvertedFormation.countDocuments({ published: true });
  console.log("total formations MNA :", totalFormationsMna);

  await findMismatch(totalFormationsMna, "cfd");
  await findMismatch(totalFormationsMna, "code_postal", "etablissement_lieu_formation_code_postal");
  await findMismatch(totalFormationsMna, "code_commune_insee", "etablissement_lieu_formation_code_insee");
  await findMismatch(totalFormationsMna, "uai_formation", "etablissement_lieu_formation_uai");

  await findMismatch(totalFormationsMna, "etablissement_gestionnaire_siret");
  await findMismatch(totalFormationsMna, "etablissement_gestionnaire_uai");
  await findMismatch(totalFormationsMna, "etablissement_formateur_siret");
  await findMismatch(totalFormationsMna, "etablissement_formateur_uai");
});
