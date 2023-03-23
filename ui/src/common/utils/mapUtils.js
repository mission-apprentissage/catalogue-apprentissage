/**
 * Get the url to an geoportail map from coordinates
 *
 * @param {*} coordinates
 * @returns An url to a geoportail map focused on coordinates
 */
export const getGeoPortailUrl = (coordinates) => {
  if (typeof coordinates !== "string") {
    return null;
  }
  const [lat, lon] = coordinates.split(",");
  return `https://www.geoportail.gouv.fr/carte?c=${lon},${lat}&z=19&l0=OPEN_STREET_MAP::GEOPORTAIL:OGC:WMTS(1)&permalink=yes`;
};

/**
 * Get the url to an openstreetmap map from coordinates
 *
 * @param {*} coordinates
 * @returns An url to a openstreetmap map focused on coordinates
 */
export const getOpenStreetMapUrl = (coordinates) => {
  if (typeof coordinates !== "string") {
    return null;
  }
  const [lat, lon] = coordinates.split(",");
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;
};
