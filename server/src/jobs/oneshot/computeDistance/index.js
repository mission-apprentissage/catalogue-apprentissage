const { getCoordinatesFromAddressData } = require("@mission-apprentissage/tco-service-node");
const { distanceBetweenCoordinates } = require("../../../common/utils/distanceUtils");
const { Formation } = require("../../../common/model");
const { runScript } = require("../../scriptWrapper");

const parseErrors = (messages) => {
  if (!messages) {
    return "";
  }
  return Object.entries(messages)
    .filter(([key, value]) => key === "error" || `${value}`.toLowerCase().includes("erreur"))
    .reduce((acc, [key, value]) => `${acc}${acc ? " " : ""}${key}: ${value}.`, "");
};

const computeDistance = async () => {
  let count = 0;
  const cursor = await Formation.find({ published: true }).cursor();
  for await (const formation of cursor) {
    if (!formation.lieu_formation_geo_coordonnees) {
      console.info(`La formation ${formation._id} n'a pas de coordonnées.`);
      continue;
    }

    if (
      !formation.lieu_formation_adresse ||
      !formation.localite ||
      !formation.code_postal ||
      !formation.code_commune_insee
    ) {
      console.info(`La formation ${formation._id} n'a pas suffisament d'informations renseignées pour son adresse.`);
      continue;
    }

    const addressData = {
      nom_voie: formation.lieu_formation_adresse,
      localite: formation.localite,
      code_postal: formation.code_postal,
      code_insee: formation.code_commune_insee,
    };

    try {
      const { result: coordinates, messages } = await getCoordinatesFromAddressData(addressData);

      const geolocError = parseErrors(messages);
      if (!geolocError && coordinates.geo_coordonnees) {
        const lieu_formation_geo_coordonnees_computed = coordinates.geo_coordonnees;

        const [lat1, lon1] = lieu_formation_geo_coordonnees_computed.split(",");
        const [lat2, lon2] = formation.lieu_formation_geo_coordonnees.split(",");

        const distance = await distanceBetweenCoordinates(lat1, lon1, lat2, lon2);

        await Formation.updateOne(
          { _id: formation._id },
          {
            $set: {
              lieu_formation_geo_coordonnees_computed,
              distance,
            },
          }
        );
      }
      if (++count % 100 === 0) {
        console.error(`${count} distance computed.`);
      }
    } catch (error) {
      console.error(error);
    }
  }
  console.info(`> ${count} formations traitées.`);
};

module.exports = computeDistance;

if (process.env.standalone) {
  runScript(async () => await computeDistance());
}
