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
  const [{ total = 0 } = {}] = await ConvertedFormation.aggregate(getMismatchPipeline(key, rcoKey));
  console.log(`total ${key} changés :`, total, `(${((total / totalFormationsMna) * 100).toFixed(2)}%)`);
};

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceInMeterBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c * 1000;
}

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
  await findMismatch(totalFormationsMna, "rncp_code");

  await findMismatch(totalFormationsMna, "etablissement_gestionnaire_siret");
  await findMismatch(totalFormationsMna, "etablissement_gestionnaire_uai");
  await findMismatch(totalFormationsMna, "etablissement_formateur_siret");
  await findMismatch(totalFormationsMna, "etablissement_formateur_uai");

  const distance = 1000;
  const pool = await ConvertedFormation.find(
    {
      published: true,
      lieu_formation_geo_coordonnees: { $ne: null },
      idea_geo_coordonnees_etablissement: { $ne: null },
    },
    { id_rco_formation: 1, lieu_formation_geo_coordonnees: 1, idea_geo_coordonnees_etablissement: 1 }
  ).lean();

  const filteredPool = pool.filter(({ lieu_formation_geo_coordonnees, idea_geo_coordonnees_etablissement }) => {
    const [ideaLat, ideaLon] = idea_geo_coordonnees_etablissement.split(",");
    const [lat, lon] = lieu_formation_geo_coordonnees.split(",");
    return (
      distanceInMeterBetweenEarthCoordinates(Number(ideaLat), Number(ideaLon), Number(lat), Number(lon)) > distance
    );
  });

  console.log(
    `total geoloc changées (éloignées de plus de ${distance}m) :`,
    filteredPool.length,
    `(${((filteredPool.length / totalFormationsMna) * 100).toFixed(2)}%)`
  );
});
