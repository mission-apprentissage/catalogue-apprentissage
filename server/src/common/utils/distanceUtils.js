const earthRadiusKm = 6371;

const degreesToRadians = (deg) => deg * (Math.PI / 180);

/**
 * @returns {number} distance in meters
 */
const distanceBetweenCoordinates = (lat1, lon1, lat2, lon2) => {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c * 1000);
};

module.exports = { distanceBetweenCoordinates };
