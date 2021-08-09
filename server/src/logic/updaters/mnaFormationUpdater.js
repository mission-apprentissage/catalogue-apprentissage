const logger = require("../../common/logger");
const Joi = require("joi");
const { getQueryFromRule } = require("../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../common/model");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getPeriodeTags } = require("../../common/utils/rcoUtils");
const { cfdMapper } = require("../mappers/cfdMapper");
const { codePostalMapper } = require("../mappers/codePostalMapper");
const { etablissementsMapper } = require("../mappers/etablissementsMapper");
const { geoMapper } = require("../mappers/geoMapper");
const { diffFormation, buildUpdatesHistory } = require("../common/utils/diffUtils");
const { SandboxFormation, RcoFormation } = require("../../common/model");
const { getCoordinatesFromAddressData } = require("@mission-apprentissage/tco-service-node");
const { distanceBetweenCoordinates } = require("../../common/utils/distanceUtils");

const formationSchema = Joi.object({
  cfd: Joi.string().required(),
  etablissement_gestionnaire_siret: Joi.string().required(),
  etablissement_formateur_siret: Joi.string().required(),
  code_postal: Joi.string().required(),
}).unknown();

const parseErrors = (messages) => {
  if (!messages) {
    return "";
  }
  return Object.entries(messages)
    .filter(([key, value]) => key === "error" || `${value}`.toLowerCase().includes("erreur"))
    .reduce((acc, [key, value]) => `${acc}${acc ? " " : ""}${key}: ${value}.`, "");
};

const findMefsForAffelnet = async (rules) => {
  const results = await SandboxFormation.find({ ...rules }, { bcn_mefs_10: 1 }).lean();

  if (results && results.length > 0) {
    return results.reduce((acc, { bcn_mefs_10 }) => {
      return [...acc, ...bcn_mefs_10];
    }, []);
  }

  return null;
};

const getInfosOffreLabel = (formation, mef) => {
  return `${formation.libelle_court} en ${mef.modalite.duree} an${Number(mef.modalite.duree) > 1 ? "s" : ""}`;
};

const mnaFormationUpdater = async (
  formation,
  { withHistoryUpdate = true, withCodePostalUpdate = true, cfdInfo = null } = {}
) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const currentCfdInfo = cfdInfo || (await cfdMapper(formation.cfd, { onisep: true }));
    const { result: cfdMapping, messages: cfdMessages } = currentCfdInfo;

    let error = parseErrors(cfdMessages);
    if (error) {
      return { updates: null, formation, error, cfdInfo };
    }

    // Trust RCO for geocoords & insee
    const rcoFormation = await RcoFormation.findOne({ id_rco_formation: formation.id_rco_formation }).lean();
    const code_commune_insee = rcoFormation?.etablissement_lieu_formation_code_insee ?? formation.code_commune_insee;
    const geoCoords =
      rcoFormation?.etablissement_lieu_formation_geo_coordonnees ?? formation.lieu_formation_geo_coordonnees;

    let cpMapping = {};
    if (geoCoords) {
      const { result = {}, messages: geoMessages } = withCodePostalUpdate
        ? await geoMapper(geoCoords, code_commune_insee)
        : {};
      const { adresse, ...rest } = result ?? {};
      cpMapping = adresse ? { lieu_formation_adresse: adresse, ...rest } : {};
      error = parseErrors(geoMessages);

      if (geoMessages?.errorType === "Insee") {
        // on Insee inconsistency calculate distance between rco address search geoloc & rco geocoords
        const { result: coordinates, messages: coordsMessages } = await getCoordinatesFromAddressData({
          numero_voie: formation.lieu_formation_adresse,
          localite: formation.localite,
          code_postal: formation.code_postal,
          code_insee: code_commune_insee,
        });

        const geolocError = parseErrors(coordsMessages);
        if (!geolocError && coordinates.geo_coordonnees) {
          const [lat, lon] = geoCoords.split(",");
          const [inconsistentLat, inconsistentLon] = coordinates.geo_coordonnees.split(",");
          const distance = distanceBetweenCoordinates(lat, lon, inconsistentLat, inconsistentLon);

          error = `${error} Distance entre le lieu de formation et la géolocalisation de ce même lieu via l'adresse fournie par RCO: ${(
            distance / 1000
          ).toFixed(2)}km (coordonnées geoloc rco : ${geoCoords} / coordonnées via adresse rco : ${
            coordinates.geo_coordonnees
          })`;
        }
      }

      if (error) {
        return { updates: null, formation, error, cfdInfo };
      }
    } else {
      const { result = {}, messages: cpMessages } = withCodePostalUpdate
        ? await codePostalMapper(formation.code_postal, code_commune_insee)
        : {};
      cpMapping = result;
      error = parseErrors(cpMessages);
      if (error) {
        return { updates: null, formation, error, cfdInfo };
      }
    }

    const rncpInfo = {
      rncp_code: cfdMapping?.rncp_code,
      rncp_intitule: cfdMapping?.rncp_intitule,
      rncp_eligible_apprentissage: cfdMapping?.rncp_eligible_apprentissage,
      ...cfdMapping?.rncp_details,
    };
    const { result: etablissementsMapping, messages: etablissementsMessages } = await etablissementsMapper(
      formation.etablissement_gestionnaire_siret,
      formation.etablissement_formateur_siret,
      rncpInfo
    );

    error = parseErrors(etablissementsMessages);
    if (error) {
      return { updates: null, formation, error, cfdInfo };
    }

    let geoMapping = { idea_geo_coordonnees_etablissement: geoCoords };
    if (withCodePostalUpdate && !geoMapping.idea_geo_coordonnees_etablissement) {
      const { result: coordinates, messages: geoMessages } = await getCoordinatesFromAddressData({
        numero_voie: formation.lieu_formation_adresse,
        localite: cpMapping.localite,
        code_postal: cpMapping.code_postal,
        code_insee: cpMapping.code_commune_insee,
      });

      const geolocError = parseErrors(geoMessages);
      if (!geolocError && coordinates.geo_coordonnees) {
        // set geo coords even if we get multiple results
        geoMapping = {
          // field is for LBA only
          idea_geo_coordonnees_etablissement: coordinates.geo_coordonnees,
        };
      }
    }

    let published = rcoFormation?.published ?? false; // not found in rco should not be published

    let update_error = null;
    if (etablissementsMapping?.etablissement_reference_published === false) {
      published = false;
      if (rcoFormation?.published) {
        update_error = "Formation not published because of etablissement_reference_published";
      }
    }

    // set tags
    let tags = [];
    try {
      const periode = JSON.parse(formation.periode);
      tags = getPeriodeTags(periode);
    } catch (e) {
      logger.error("unable to set tags", e);
    }

    /*
     * UAI rules :
     * 1. modification de fiche
     * 2. UAI formateur
     * 3. UAI RCO ? (mais qui devrait être égale à UAI formateur puisque RCO utilise les TCO pour charger les UAI formateurs)...
     */
    let uai_formation;
    // check if it was set by user
    uai_formation = formation?.editedFields?.uai_formation;
    // no uai ? try to fill it with etablissement formateur
    if (!uai_formation) {
      uai_formation = etablissementsMapping?.etablissement_formateur_uai;
    }

    // TODO should try with etablissement_lieu_formation_uai from RCO but always empty for now on  ¯\_(ツ)_/¯
    if (!uai_formation) {
      uai_formation = formation.uai_formation;
    }

    const updatedFormation = {
      ...formation,
      ...cfdMapping,
      ...cpMapping,
      ...etablissementsMapping,
      ...geoMapping,
      tags,
      published,
      update_error,
      uai_formation,
      ...formation?.editedFields,
    };

    // try to fill mefs for Affelnet
    // reset field value
    updatedFormation.mefs_10 = null;
    if (updatedFormation.bcn_mefs_10?.length > 0) {
      //  filter bcn_mefs_10 to get mefs_10 for affelnet

      // eslint-disable-next-line no-unused-vars
      const { _id, ...rest } = updatedFormation;

      const aPublierRules = await ReglePerimetre.find({
        plateforme: "affelnet",
        statut: "à publier",
        is_deleted: { $ne: true },
      }).lean();

      const aPublierSoumisAValidationRules = await ReglePerimetre.find({
        plateforme: "affelnet",
        statut: "à publier (soumis à validation)",
        is_deleted: { $ne: true },
      }).lean();

      // Split formation into N formation with 1 mef each
      // & insert theses into a tmp collection
      await asyncForEach(updatedFormation.bcn_mefs_10, async (mefObj) => {
        await new SandboxFormation({
          ...rest,
          mef_10_code: mefObj.mef10,
          bcn_mefs_10: [mefObj],
        }).save();
      });

      // apply pertinence filters against the tmp collection
      // check "à publier" first to have less mefs
      // Add current id_rco_formation to ensure no concurrent access in db
      let mefs_10 = await findMefsForAffelnet({
        id_rco_formation: rest.id_rco_formation,
        $or: aPublierRules.map(getQueryFromRule),
      });

      if (!mefs_10) {
        mefs_10 = await findMefsForAffelnet({
          id_rco_formation: rest.id_rco_formation,
          $or: aPublierSoumisAValidationRules.map(getQueryFromRule),
        });
      }

      if (mefs_10) {
        // keep the successful mefs in affelnet field
        updatedFormation.mefs_10 = mefs_10;

        if (
          mefs_10.length === 1 &&
          (!updatedFormation.affelnet_infos_offre ||
            updatedFormation.affelnet_infos_offre.match(`${updatedFormation.libelle_court} en . an.?$`))
        ) {
          updatedFormation.affelnet_infos_offre = getInfosOffreLabel(updatedFormation, mefs_10[0]);
        }

        if (mefs_10.length === 1) {
          updatedFormation.duree = mefs_10[0].modalite.duree;
          updatedFormation.annee = mefs_10[0].modalite.annee;
        }
      }

      await SandboxFormation.deleteMany({ id_rco_formation: rest.id_rco_formation });
    }

    // compute distance between lieu formation & etablissement formateur
    if (updatedFormation.lieu_formation_geo_coordonnees && updatedFormation.geo_coordonnees_etablissement_formateur) {
      const [formateurLat, formateurLon] = updatedFormation.geo_coordonnees_etablissement_formateur.split(",");
      const [lat, lon] = updatedFormation.lieu_formation_geo_coordonnees.split(",");
      updatedFormation.distance_lieu_formation_etablissement_formateur = distanceBetweenCoordinates(
        Number(formateurLat),
        Number(formateurLon),
        Number(lat),
        Number(lon)
      );
    }

    const { updates, keys } = diffFormation(formation, updatedFormation);
    if (updates) {
      if (withHistoryUpdate) {
        updatedFormation.updates_history = buildUpdatesHistory(formation, updates, keys);
      }
      return { updates, formation: updatedFormation, cfdInfo };
    }

    return { updates: null, formation, cfdInfo };
  } catch (e) {
    logger.error(e);
    return { updates: null, formation, error: e.toString(), cfdInfo: null };
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;
