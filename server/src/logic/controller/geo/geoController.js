const axios = require("axios");
const ApiEsSup = require("../../../common/apis/ApiEsSup");
const geoAdresseData = require("./geoAdresseData");
const fs = require("fs-extra");
const path = require("path");

const opendataApiKey = "19b8028585be8b5c2ebc456a6363756a48b680d8447a1ebfb8a1d10f";
const apiEsSup = new ApiEsSup();

class GeoController {
  constructor() {
    this.departements = fs.readJsonSync(path.resolve(__dirname, "./assets/dataDepartements.json"));
  }

  async searchDataSoft(code) {
    try {
      const response = await axios.get(
        `https://data.opendatasoft.com/api/records/1.0/search/?dataset=correspondance-code-insee-code-postal%40public&rows=1&fields=insee_com,code_dept,postal_code,nom_comm&q=(insee_com:${code} OR postal_code:${code})`,
        {
          headers: {
            Authorization: `Apikey ${opendataApiKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findCode(code, codeInsee) {
    try {
      const { records = [] } = await geoAdresseData.getMunicipality(code, codeInsee);
      if (records.length === 0) {
        return {
          info: "Erreur: Non trouvé",
          value: null,
        };
      }
      const {
        fields: { insee_com, code_dept, postal_code, nom_comm },
      } = records[0];
      const value = { insee_com, code_dept, postal_code, nom_comm };

      if (insee_com === code) {
        return {
          info: "Ok",
          update: `Le code ${code} est un code commune insee`,
          value,
        };
      }
      return {
        info: "Ok",
        value,
      };
    } catch (error) {
      return error;
    }
  }

  findDataByDepartementNum(code_dept) {
    const data = this.departements[code_dept];
    if (!data) {
      return { nom_dept: null, nom_region: null, code_region: null, nom_academie: null, num_academie: null };
    }

    const { nom_dept, nom_region, code_region, nom_academie, num_academie } = data;
    return { nom_dept, nom_region, code_region, nom_academie, num_academie };
  }

  async findNomAcademie(code_dept) {
    const nomAcademie = await apiEsSup.getNomAcademieInfoFromNumDepartement(code_dept);
    if (!nomAcademie) {
      return {
        info: `Impossible de retrouver le nom d'academie du département: ${code_dept}`,
        value: null,
      };
    }
    return {
      info: `Ok`,
      value: nomAcademie,
    };
  }

  async findNumAcademie(code_dept) {
    const numAcademie = await apiEsSup.getNumAcademieInfoFromNumDepartement(code_dept);
    if (!numAcademie) {
      return {
        info: `Impossible de retrouver le numéro d'academie du département: ${code_dept}`,
        value: null,
      };
    }
    return {
      info: `Ok`,
      value: numAcademie,
    };
  }

  async findAcademie(code_dept) {
    const response = await apiEsSup.getInfoFromNumDepartement(code_dept);

    let numAcademie;
    let numAcademieData;
    if (response && response.aca_code) {
      numAcademie = Number.parseInt(response.aca_code);
      numAcademieData = {
        info: "Ok",
        value: numAcademie,
      };
    } else {
      numAcademieData = {
        info: `Impossible de retrouver le numéro d'academie du département: ${code_dept}`,
        value: null,
      };
    }

    let nomAcademie;
    let nomAcademieData;
    if (response && response.aca_nom) {
      nomAcademie = response.aca_nom;
      nomAcademieData = {
        info: "Ok",
        value: nomAcademie,
      };
    } else {
      nomAcademieData = {
        info: `Impossible de retrouver le nom d'academie du département: ${code_dept}`,
        value: null,
      };
    }

    return {
      nomAcademie: nomAcademieData,
      numAcademie: numAcademieData,
    };
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

  isValidCodePostal(codePostal) {
    return /^[0-9]{5}$/g.test(codePostal);
  }

  /**
   * Le code commune Insee contient cinq chiffres ou lettres (Corse 2A - 2B)
   */
  isValidCodeInsee(codeInsee) {
    return /^[a-zA-Z0-9]{5}$/g.test(codeInsee);
  }
}

const geoController = new GeoController();
module.exports = geoController;
