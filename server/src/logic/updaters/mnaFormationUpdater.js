const logger = require("../../common/logger");
const Joi = require("joi");
const { getQueryFromRule } = require("../../common/utils/rulesUtils");
const { ReglePerimetre } = require("../../common/model");
const { asyncForEach } = require("../../common/utils/asyncUtils");
const { getPeriodeTags, extractFirstValue } = require("../../common/utils/rcoUtils");
const { cfdMapper } = require("../mappers/cfdMapper");
const { codePostalMapper } = require("../mappers/codePostalMapper");
const { etablissementsMapper } = require("../mappers/etablissementsMapper");
const { geoMapper } = require("../mappers/geoMapper");
const { diffFormation } = require("../common/utils/diffUtils");
const { SandboxFormation, RcoFormation } = require("../../common/model");
const { getCoordinatesFromAddressData } = require("@mission-apprentissage/tco-service-node");
const { distanceBetweenCoordinates } = require("../../common/utils/distanceUtils");
const { findMefsForParcoursup } = require("../../common/utils/parcoursupUtils");
const { updateEtablissementTags } = require("./etablissementUpdater");
const { AFFELNET_STATUS } = require("../../constants/status");

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

/**
 * Sélection des MEFs :
 * 1 - On récupère les MEFs de la BCN pour le CFD de la formation
 * 2 - On filtre ceux qui correspondent aux modalités collectées par RCO (année et/ou durée si on les reçoit)
 * 3 - Pour Parcoursup on filtre par dessus les MEFs qu'on retrouve dans la liste des MEFs fiabilisés (fichier uploadé dans l'admin)
 * 3' - Pour Affelnet on applique les règles de périmètre et on garde le premier qui est accepté ( "à publier" > "à publier soumis à validation")
 */
const selectMefs = async (updatedFormation) => {
  let bcn_mefs_10 = updatedFormation.bcn_mefs_10;
  let affelnet_mefs_10 = null;
  let affelnet_infos_offre = updatedFormation.affelnet_infos_offre;
  let parcoursup_mefs_10 = null;
  let duree_incoherente = false;
  let annee_incoherente = false;

  // filter bcn_mefs_10 with data received from RCO
  const duree = updatedFormation.duree;
  if (duree && duree !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.duree === duree;
    });

    duree_incoherente =
      updatedFormation.bcn_mefs_10.length &&
      updatedFormation.bcn_mefs_10.every(({ modalite }) => {
        return modalite.duree !== duree;
      });
  }

  const annee = updatedFormation.annee;
  if (annee && annee !== "X") {
    bcn_mefs_10 = bcn_mefs_10?.filter(({ modalite }) => {
      return modalite.annee === annee;
    });

    annee_incoherente =
      updatedFormation.bcn_mefs_10.length &&
      updatedFormation.bcn_mefs_10.every(({ modalite }) => {
        return modalite.annee !== annee;
      });
  }

  // try to fill mefs for Affelnet
  if (bcn_mefs_10?.length > 0) {
    //  filter bcn_mefs_10 to get affelnet_mefs_10 for affelnet

    // eslint-disable-next-line no-unused-vars
    const { _id, updates_history, ...rest } = updatedFormation;

    const aPublierRules = await ReglePerimetre.find({
      plateforme: "affelnet",
      statut: AFFELNET_STATUS.A_PUBLIER,
      is_deleted: { $ne: true },
    }).lean();

    const aPublierSoumisAValidationRules = await ReglePerimetre.find({
      plateforme: "affelnet",
      statut: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
      is_deleted: { $ne: true },
    }).lean();

    // Split formation into N formation with 1 mef each
    // & insert theses into a tmp collection
    await asyncForEach(bcn_mefs_10, async (mefObj) => {
      await new SandboxFormation({
        ...rest,
        bcn_mefs_10: [mefObj],
      }).save({ validateBeforeSave: false });
    });

    // apply perimetre filters against the tmp collection
    // check "à publier" first to have less mefs
    // Add current cle_ministere_educatif to ensure no concurrent access in db
    let filtered_affelnet_mefs_10 = await findMefsForAffelnet({
      cle_ministere_educatif: rest.cle_ministere_educatif,
      $or: aPublierRules.map(getQueryFromRule),
    });

    if (!filtered_affelnet_mefs_10) {
      filtered_affelnet_mefs_10 = await findMefsForAffelnet({
        cle_ministere_educatif: rest.cle_ministere_educatif,
        $or: aPublierSoumisAValidationRules.map(getQueryFromRule),
      });
    }

    if (filtered_affelnet_mefs_10) {
      // keep the successful mefs in affelnet field
      affelnet_mefs_10 = filtered_affelnet_mefs_10;

      if (
        affelnet_mefs_10.length === 1 &&
        (!affelnet_infos_offre || affelnet_infos_offre.match(`${updatedFormation.libelle_court} en . an.?$`))
      ) {
        affelnet_infos_offre = getInfosOffreLabel(updatedFormation, affelnet_mefs_10[0]);
      }
    }

    await SandboxFormation.deleteMany({ cle_ministere_educatif: rest.cle_ministere_educatif });
  }

  // try to fill mefs for Parcoursup
  if (bcn_mefs_10?.length > 0) {
    parcoursup_mefs_10 = findMefsForParcoursup(updatedFormation);
  }

  return {
    bcn_mefs_10,
    affelnet_mefs_10,
    affelnet_infos_offre,
    parcoursup_mefs_10,
    duree_incoherente,
    annee_incoherente,
  };
};

const mnaFormationUpdater = async (formation, { withCodePostalUpdate = true, cfdInfo = null } = {}) => {
  try {
    await formationSchema.validateAsync(formation, { abortEarly: false });

    const currentCfdInfo = cfdInfo || (await cfdMapper(formation.cfd, { onisep: true }));
    const { result: cfdMapping, messages: cfdMessages } = currentCfdInfo;

    let error = parseErrors(cfdMessages);
    if (error) {
      return { updates: null, formation, error, cfdInfo: currentCfdInfo };
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
      return { updates: null, formation, error, cfdInfo: currentCfdInfo };
    }

    // Trust RCO for geocoords & insee
    const rcoFormation = await RcoFormation.findOne({
      cle_ministere_educatif: formation.cle_ministere_educatif,
    }).lean();
    const code_commune_insee = extractFirstValue(
      rcoFormation?.etablissement_lieu_formation_code_insee ?? formation.code_commune_insee
    );
    const code_postal = extractFirstValue(
      rcoFormation?.etablissement_lieu_formation_code_postal ?? formation.code_postal
    );

    const { result: cpMapping = {}, messages: cpMessages } =
      withCodePostalUpdate || !formation.localite ? await codePostalMapper(code_postal, code_commune_insee) : {};

    error = parseErrors(cpMessages);
    if (error) {
      return { updates: null, formation, error, cfdInfo: currentCfdInfo };
    }

    // ensure address from RCO is kept
    cpMapping.lieu_formation_adresse = extractFirstValue(
      rcoFormation?.etablissement_lieu_formation_adresse ?? formation.lieu_formation_adresse
    );

    // retrieve informative data to help RCO fix the collect
    const geoCoords = extractFirstValue(
      rcoFormation?.etablissement_lieu_formation_geo_coordonnees ?? formation.lieu_formation_geo_coordonnees
    );

    // Calcul des coordonnées et de l'adresse à partir des informations RCO. Permet de savoir si les données transmises sont cohérentes.
    const computedFields = {};

    // Compute adress from rco etablissement_lieu_formation_geo_coordonnees
    if (withCodePostalUpdate || !formation.lieu_formation_adresse_computed) {
      const { result: addressResults = {}, messages: addressMessages } = await geoMapper(
        geoCoords,
        cpMapping.code_commune_insee ?? code_commune_insee
      );

      if (!parseErrors(addressMessages) && addressResults?.adresse) {
        computedFields.lieu_formation_adresse_computed = `${addressResults.adresse}, ${addressResults.code_postal} ${addressResults.localite}`;
      } else {
        computedFields.lieu_formation_adresse_computed = null;
      }
    }

    // Compute geo_coordonnees from rco etablissement_lieu_formation_adresse
    if (withCodePostalUpdate || !formation.lieu_formation_geo_coordonnees_computed) {
      const { result: coordinatesResults, messages: coordinatesMessages } = await getCoordinatesFromAddressData({
        numero_voie: cpMapping.lieu_formation_adresse,
        localite: cpMapping.localite ?? formation.localite,
        code_postal: cpMapping.code_postal ?? code_postal,
        code_insee: cpMapping.code_commune_insee ?? code_commune_insee,
      });

      if (!parseErrors(coordinatesMessages) && coordinatesResults.geo_coordonnees) {
        computedFields.lieu_formation_geo_coordonnees_computed = coordinatesResults.geo_coordonnees;
      } else {
        computedFields.lieu_formation_geo_coordonnees_computed = null;
      }
    }

    // Compute distance between rco etablissement_lieu_formation_adresse & rco etablissement_lieu_formation_geo_coordonnees
    if (withCodePostalUpdate || typeof formation.distance === "undefined" || formation.distance === null) {
      const [lat, lon] = geoCoords?.split(",") ?? [];
      const [computedLat, computedLon] =
        computedFields.lieu_formation_geo_coordonnees_computed?.split(",") ??
        formation.lieu_formation_geo_coordonnees_computed?.split(",") ??
        [];
      if (lat && lon && computedLat && computedLon) {
        computedFields.distance = distanceBetweenCoordinates(lat, lon, computedLat, computedLon);
      } else {
        computedFields.distance = null;
      }
    }

    let geoMapping = { idea_geo_coordonnees_etablissement: geoCoords };
    if (withCodePostalUpdate && !geoMapping.idea_geo_coordonnees_etablissement) {
      const { result: coordinates, messages: geoMessages } = await getCoordinatesFromAddressData({
        numero_voie: cpMapping.lieu_formation_adresse,
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
      tags = getPeriodeTags(rcoFormation?.periode);

      await updateEtablissementTags({ siret: formation.etablissement_gestionnaire_siret, tags });

      if (formation.etablissement_gestionnaire_siret !== formation.etablissement_formateur_siret) {
        await updateEtablissementTags({ siret: formation.etablissement_formateur_siret, tags });
      }
    } catch (e) {
      logger.error("unable to set tags", e);
    }

    /*
     * UAI rules :
     * 1. modification de fiche
     * 2. UAI formateur
     * 3. UAI RCO ? (mais qui devrait être égale à UAI formateur puisque RCO utilise les TCO pour charger les UAI formateurs)...
     */
    let uai_formation = null;
    // check if it was set by user
    uai_formation = formation?.editedFields?.uai_formation || null;
    // no uai ? try to fill it with etablissement formateur
    if (!uai_formation) {
      uai_formation = etablissementsMapping?.etablissement_formateur_uai || null;
    }

    // TODO should try with etablissement_lieu_formation_uai from RCO but always empty for now on  ¯\_(ツ)_/¯
    if (!uai_formation) {
      uai_formation = formation.uai_formation || null;
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
      ...(uai_formation ? { uai_formation: uai_formation?.trim() } : {}),
      ...computedFields,
      ...formation?.editedFields,
    };

    // trust rco for duree & annee
    updatedFormation.duree = rcoFormation?.duree ?? formation.duree;
    updatedFormation.annee = rcoFormation?.entree_apprentissage ?? formation.annee;

    const {
      bcn_mefs_10,
      affelnet_mefs_10,
      affelnet_infos_offre,
      parcoursup_mefs_10,
      duree_incoherente,
      annee_incoherente,
    } = await selectMefs(updatedFormation);
    updatedFormation.bcn_mefs_10 = bcn_mefs_10;
    updatedFormation.affelnet_mefs_10 = affelnet_mefs_10;
    updatedFormation.affelnet_infos_offre = affelnet_infos_offre;
    updatedFormation.parcoursup_mefs_10 = parcoursup_mefs_10;
    updatedFormation.duree_incoherente = duree_incoherente;
    updatedFormation.annee_incoherente = annee_incoherente;

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

    const { updates } = diffFormation(formation, updatedFormation);

    if (updates) {
      return { updates, formation: updatedFormation, cfdInfo: currentCfdInfo };
    }

    return { updates: null, formation, cfdInfo: currentCfdInfo };
  } catch (e) {
    logger.error(e);
    console.error(e);
    return { updates: null, formation, error: e.toString(), cfdInfo: null };
  }
};

module.exports.mnaFormationUpdater = mnaFormationUpdater;
