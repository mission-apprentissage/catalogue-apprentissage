const geoAdresseData = require("./geoAdresseData");
const fs = require("fs-extra");
const path = require("path");

class GeoController {
  constructor() {
    this.departements = fs.readJsonSync(path.resolve(__dirname, "./assets/dataDepartements.json"));
  }

  findDataByDepartementNum(code_dept) {
    const data = this.departements[code_dept];
    if (!data) {
      return { nom_dept: null, nom_region: null, code_region: null, nom_academie: null, num_academie: null };
    }

    const { nom_dept, nom_region, code_region, nom_academie, num_academie } = data;
    return { nom_dept, nom_region, code_region, nom_academie, num_academie };
  }

  async findGeoCoordinateFromAdresse({ numero_voie, type_voie, nom_voie, code_postal, localite, code_insee }) {
    const { geo_coordonnees, results_count } = await geoAdresseData.getGeoCoordinateFromAdresse({
      numero_voie,
      type_voie,
      nom_voie,
      code_postal,
      localite,
      code_insee,
    });

    return {
      info: `Ok`,
      value: geo_coordonnees,
      count: results_count,
    };
  }

  async findAddressFromGeoCoordinates({ latitude, longitude }) {
    const { address, results_count } = await geoAdresseData.getAddressFromGeoCoordinates({ latitude, longitude });
    return {
      info: `Ok`,
      value: address,
      count: results_count,
    };
  }
}

const geoController = new GeoController();
module.exports = geoController;
