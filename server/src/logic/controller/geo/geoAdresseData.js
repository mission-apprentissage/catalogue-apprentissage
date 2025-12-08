const logger = require("../../../common/logger");
const ApiGeoAdresse = require("../../../common/apis/ApiGeoAdresse");

class GeoAdresseData {
  constructor() {
    this.apiGeoAdresse = new ApiGeoAdresse();
  }

  getAddress(numero_voie, type_voie, nom_voie, code_postal, localite, code_insee) {
    return `${
      code_insee
        ? `https://api-adresse.data.gouv.fr/search/?q=${numero_voie ? numero_voie + "+" : ""}${
            type_voie ? type_voie + "+" : ""
          }+${nom_voie ? nom_voie : ""}&citycode=${code_insee} or `
        : ""
    }https://api-adresse.data.gouv.fr/search/?q=${numero_voie ? numero_voie + "+" : ""}${
      type_voie ? type_voie + "+" : ""
    }+${nom_voie ? nom_voie : ""}&postcode=${code_postal} - ${localite} `;
  }

  // le code postal 75116 ne remonte rien, il doit être remplacé par 75016
  refinePostcode(postcode) {
    if (postcode === "75116") return "75016";
    else if (postcode === "97142") return "97139";
    //TODO: hardcoded à supprimer quand la BAN remontera correctement les adresse du cp 97142 pour "Les Abymes" en Guadeloupe
    else return postcode;
  }

  async getGeoCoordinateFromAdresse({ numero_voie, type_voie, nom_voie, code_postal, localite, code_insee }) {
    // première tentative de recherche sur rue et code postal

    if (code_postal === "97133") {
      //TODO: hardcoded à supprimer quand la BAN remontera correctement les adresse du cp 97133 pour "Saint Barthélémy"
      // cas particulier concernant un unique college à saint barth'
      return {
        geo_coordonnees: "17.896279,-62.849772", // format "lat,long"
        results_count: 1,
      };
    }

    if (!code_postal) {
      logger.error(
        `No postcode for establishment.\t${this.getAddress(
          numero_voie,
          type_voie,
          nom_voie,
          code_postal,
          localite,
          code_insee
        )}`
      );
      return {
        geo_coordonnees: null,
        results_count: 0,
      };
    }

    let responseApiAdresse;
    let query = `${numero_voie ? numero_voie + "+" : ""}${type_voie ? type_voie + "+" : ""}${nom_voie ? nom_voie : ""}`;
    // première recherche sur code insee
    if (code_insee) {
      try {
        responseApiAdresse = await this.apiGeoAdresse.search(query, { citycode: code_insee });
      } catch (error) {
        logger.error(`geo search error : ${query} ${code_insee} ${error}`);
        responseApiAdresse = null;
      }
    }

    if (!responseApiAdresse || responseApiAdresse.features.length === 0) {
      if (code_insee) {
        logger.debug(`Second geoloc call with postcode\t${code_postal}`);
      }
      let postcode = this.refinePostcode(code_postal);
      try {
        responseApiAdresse = await this.apiGeoAdresse.search(query, { postcode });
      } catch (error) {
        logger.error(`geo search error : ${query} ${postcode} ${error}`);
        responseApiAdresse = null;
      }
    }

    // si pas de réponse troisième recherche sur ville et code postal
    if (!responseApiAdresse || responseApiAdresse.features.length === 0) {
      logger.debug(`${code_insee ? "Third" : "Second"} geoloc call with postcode and city\t${localite} ${code_postal}`);
      let query = `${localite ? localite : "a"}`; // hack si localite absente
      let postcode = this.refinePostcode(code_postal);

      try {
        responseApiAdresse = await this.apiGeoAdresse.search(query, { postcode });
      } catch (error) {
        logger.error(`geo search error : ${query} ${postcode} ${error}`);
        responseApiAdresse = null;
      }
    }

    if (!responseApiAdresse)
      return {
        geo_coordonnees: null,
        results_count: 0,
      };

    if (responseApiAdresse.features.length === 0) {
      logger.error(
        `No geoloc result for establishment.\t${this.getAddress(
          numero_voie,
          type_voie,
          nom_voie,
          code_postal,
          localite,
          code_insee
        )}`
      );
      return {
        geo_coordonnees: null,
        results_count: 0,
      };
    }

    // signalement des cas avec ambiguité
    if (responseApiAdresse.features.length > 1) {
      logger.debug(
        `Multiple geoloc results for establishment.\t${this.getAddress(
          numero_voie,
          type_voie,
          nom_voie,
          code_postal,
          localite,
          code_insee
        )}\t${responseApiAdresse.features[0].properties.label} ${responseApiAdresse.features[0].properties.postcode}`
      );
    }

    const geojson = { ...responseApiAdresse };

    return {
      geo_coordonnees: `${geojson.features[0].geometry.coordinates[1]},${geojson.features[0].geometry.coordinates[0]}`, // format "lat,long"
      results_count: geojson.features.length,
    };
  }

  formatMunicipality({ properties }) {
    return {
      fields: {
        insee_com: properties.citycode,
        postal_code: properties.postcode,
        nom_comm: properties.city,
        code_dept: properties.context.split(",")[0],
      },
    };
  }

  /**
   * Format the results of apiGeoAdresse.searchMunicipalityByCode calls
   */
  async formatMunicipalityResponse(data) {
    const records = data.features.map(this.formatMunicipality);

    return {
      records,
    };
  }

  /**
   * Retrieve a municipality by postal code or insee code
   */
  async getMunicipality(code, codeInsee) {
    const refinedCode = this.refinePostcode(code);

    // try to find results by postal code & citycode (insee)
    if (codeInsee) {
      try {
        let data = await this.apiGeoAdresse.searchMunicipalityByCode(refinedCode, { codeInsee });
        if (data.features && data.features.length > 0) {
          return this.formatMunicipalityResponse(data);
        }
      } catch (e) {
        logger.error(`geo search municipality error ${code},${codeInsee}: ${e}`);
      }
    }

    // try to find results by postal code
    try {
      let data = await this.apiGeoAdresse.searchMunicipalityByCode(refinedCode);
      if (data.features && data.features.length > 0) {
        return this.formatMunicipalityResponse(data);
      }
    } catch (e) {
      logger.error(`geo search municipality error ${code},${codeInsee}: ${e}`);
    }

    try {
      // try to find results by citycode (insee)
      let data = await this.apiGeoAdresse.searchMunicipalityByCode(refinedCode, { isCityCode: true });
      if (data.features && data.features.length > 0) {
        return this.formatMunicipalityResponse(data);
      }
    } catch (e) {
      logger.error(`geo search municipality error ${code},${codeInsee}: ${e}`);
    }

    return {};
  }

  async getAddressFromGeoCoordinates({ latitude, longitude }) {
    try {
      const data = await this.apiGeoAdresse.reverse(longitude, latitude, { type: "housenumber" });

      if (!(data.features?.length > 0)) {
        return {
          address: null,
          results_count: 0,
        };
      }

      if (data.features.length > 1) {
        logger.debug("Multiple results for lat,lon: ", latitude, longitude);
      }

      const { properties } = data.features[0];
      const { housenumber = "", street = "" } = properties;
      const [type_voie, ...rest] = street.split(" ");
      let nom_voie = rest.join(" ");

      // handle edge case where api adresse sends a street instead of a housenumber
      if (properties.type === "street") {
        nom_voie = properties.name;
      }

      return {
        address: {
          ...this.formatMunicipality({ properties }).fields,
          numero_voie: housenumber,
          type_voie,
          nom_voie,
        },
        results_count: data.features.length,
      };
    } catch (e) {
      logger.error(`geo reverse error ${latitude},${longitude}: ${e}`);
    }

    return {
      address: null,
      results_count: 0,
    };
  }
}

const geoAdresseData = new GeoAdresseData();
module.exports = geoAdresseData;
