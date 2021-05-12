const logger = require("../../common/logger");
const Joi = require("joi");
const { aPublierRules, aPublierSoumisAValidationRules } = require("../../jobs/pertinence/affelnet/rules");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getPeriodeTags } = require("../../jobs/common/utils/rcoUtils");
const { cfdMapper } = require("../mappers/cfdMapper");
const { codePostalMapper } = require("../mappers/codePostalMapper");
const { etablissementsMapper } = require("../mappers/etablissementsMapper");
const { diffFormation, buildUpdatesHistory } = require("../common/utils/diffUtils");
const { SandboxFormation, RcoFormation } = require("../../common/model");
const { getCoordinatesFromAddressData } = require("@mission-apprentissage/tco-service-node");

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
  { withHistoryUpdate = true, withCodePostalUpdate = true, cfdInfo = null, withRCOInsee = false } = {}
) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const currentCfdInfo = cfdInfo || (await cfdMapper(formation.cfd, { onisep: true }));
    const { result: cfdMapping, messages: cfdMessages } = currentCfdInfo;

    let error = parseErrors(cfdMessages);
    if (error) {
      return { updates: null, formation, error, cfdInfo };
    }

    let code_commune_insee = formation.code_commune_insee;
    if (withRCOInsee) {
      const rcoFormation = await RcoFormation.findOne({ id_rco_formation: formation.id_rco_formation }).lean();
      code_commune_insee = rcoFormation?.etablissement_lieu_formation_code_insee ?? formation.code_commune_insee;
    }

    const { result: cpMapping = {}, messages: cpMessages } = withCodePostalUpdate
      ? await codePostalMapper(formation.code_postal, code_commune_insee)
      : {};
    error = parseErrors(cpMessages);
    if (error) {
      return { updates: null, formation, error, cfdInfo };
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

    let geoMapping = {};
    if (withCodePostalUpdate) {
      const { result: coordinates, messages: geoMessages } = await getCoordinatesFromAddressData({
        numero_voie: formation.lieu_formation_adresse,
        localite: cpMapping.localite,
        code_postal: cpMapping.code_postal,
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

    const rcoFormation = await RcoFormation.findOne({ id_rco_formation: formation.id_rco_formation });
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
        $and: [...aPublierRules["$and"], { id_rco_formation: rest.id_rco_formation }],
      });

      if (!mefs_10) {
        mefs_10 = await findMefsForAffelnet({
          $and: [...aPublierSoumisAValidationRules["$and"], { id_rco_formation: rest.id_rco_formation }],
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
