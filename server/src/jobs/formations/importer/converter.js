const config = require("config");
const {
  isValideUAI,
  getCoordinatesFromAddressData,
  getAddressFromCoordinates,
} = require("@mission-apprentissage/tco-service-node");
const { diff: objectDiff } = require("deep-object-diff");
const { diff: arrayDiff } = require("deep-object-diff");
const { Formation, DualControlFormation, Etablissement } = require("../../../common/models/index");
const { cursor } = require("../../../common/utils/cursor");
const { distanceBetweenCoordinates } = require("../../../common/utils/distanceUtils");
const logger = require("../../../common/logger");
const { computeMefs } = require("../../../logic/finder/mefsFinder");
const { getCfdEntree, getCfdEntreeDateFermeture } = require("../../../logic/finder/cfdEntreeFinder");
const { PARCOURSUP_STATUS, AFFELNET_STATUS } = require("../../../constants/status");
const { getCampagneStartDate } = require("../../../common/utils/rulesUtils");

const updateRelationFields = async ({ filter = {} }) => {
  logger.info({ type: "job" }, " == Updating relations for formations == ");

  await cursor(Formation.find(filter).sort(), async (formation) => {
    await Formation.updateOne({ _id: formation._id }, { $set: { ...(await computeRelationFields(formation)) } });
  });

  logger.info({ type: "job" }, " == Updating relations for formations: DONE == ");
};

const computeRelationFields = async (fields) => {
  const etablissementGestionnaire = await Etablissement.findOne({ siret: fields.etablissement_gestionnaire_siret });
  const etablissementFormateur = await Etablissement.findOne({ siret: fields.etablissement_formateur_siret });
  const etablissementLieu = await Etablissement.findOne({ siret: fields.etablissement_lieu_formation_siret });

  const etablissement_gestionnaire_id = etablissementGestionnaire?.id;
  const etablissement_formateur_id = etablissementFormateur?.id;
  const lieu_formation_id = etablissementLieu?.id;
  const etablissement_gestionnaire_published = etablissementGestionnaire?.published;
  const etablissement_formateur_published = etablissementFormateur?.published;
  const lieu_formation_published = etablissementLieu?.published;

  return {
    etablissement_gestionnaire_id,
    etablissement_formateur_id,
    lieu_formation_id,
    etablissement_gestionnaire_published,
    etablissement_formateur_published,
    lieu_formation_published,
  };
};

const recomputeFields = async (fields, oldFields, { forceRecompute = false } = { forceRecompute: false }) => {
  // MEFS & PLATEFORMES

  let bcn_mefs_10 = oldFields?.bcn_mefs_10 ?? [],
    affelnet_mefs_10 = oldFields?.affelnet_mefs_10 ?? [],
    affelnet_infos_offre = oldFields?.affelnet_infos_offre,
    parcoursup_mefs_10 = oldFields?.parcoursup_mefs_10 ?? [],
    duree_incoherente = oldFields?.duree_incoherente,
    annee_incoherente = oldFields?.annee_incoherente;

  if (
    forceRecompute ||
    Object.entries(
      objectDiff(
        fields?.bcn_mefs_10.map(({ date_fermeture, ...mef }) => mef),
        oldFields?.bcn_mefs_10.map(({ date_fermeture, ...mef }) => mef)
      ) ?? {}
    ).length ||
    fields?.duree !== oldFields?.duree ||
    fields?.annee !== oldFields?.annee ||
    fields?.diplome !== oldFields?.diplome ||
    fields?.num_academie !== oldFields?.num_academie ||
    fields?.rncp_details?.code_type_certif !== oldFields?.rncp_details?.code_type_certif ||
    new Date(fields?.rncp_details?.date_fin_validite_enregistrement).getTime() !==
      new Date(oldFields?.rncp_details?.date_fin_validite_enregistrement).getTime() ||
    new Date(fields?.cfd_date_fermeture).getTime() !== new Date(oldFields?.cfd_date_fermeture).getTime() ||
    arrayDiff(fields?.date_debut, oldFields?.date_debut).length
  ) {
    ({ bcn_mefs_10, affelnet_mefs_10, affelnet_infos_offre, parcoursup_mefs_10, duree_incoherente, annee_incoherente } =
      await computeMefs(fields, oldFields));
  }

  // DISTANCE_LIEU_FORMATION_ETABLISSEMENT_FORMATEUR

  let distance_lieu_formation_etablissement_formateur = oldFields?.distance_lieu_formation_etablissement_formateur;

  if (
    forceRecompute ||
    fields.geo_coordonnees_etablissement_formateur !== oldFields?.geo_coordonnees_etablissement_formateur ||
    fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnees
  ) {
    if (!!fields.geo_coordonnees_etablissement_formateur && !!fields.lieu_formation_geo_coordonnees) {
      distance_lieu_formation_etablissement_formateur =
        fields.geo_coordonnees_etablissement_formateur &&
        fields.lieu_formation_geo_coordonnees &&
        distanceBetweenCoordinates(
          Number(fields.geo_coordonnees_etablissement_formateur?.split("##")[0]?.split(",")[1]),
          Number(fields.geo_coordonnees_etablissement_formateur?.split("##")[0]?.split(",")[0]),
          Number(fields.lieu_formation_geo_coordonnees?.split("##")[0]?.split(",")[0]),
          Number(fields.lieu_formation_geo_coordonnees?.split("##")[0]?.split(",")[1])
        );
    } else {
      distance_lieu_formation_etablissement_formateur = undefined;
    }
  }

  // UAI_FORMATION

  const uai_formation =
    oldFields?.editedFields?.uai_formation ??
    fields?.uai_formation ??
    (fields?.code_commune_insee === fields?.etablissement_formateur_code_commune_insee
      ? (fields?.etablissement_formateur_uai ?? oldFields?.uai_formation ?? oldFields?.etablissement_formateur_uai)
      : undefined);
  const uai_formation_valide = !!uai_formation && (await isValideUAI(uai_formation));

  let lieu_formation_geo_coordonnees_computed = oldFields?.lieu_formation_geo_coordonnees_computed;
  let lieu_formation_adresse_computed = oldFields?.lieu_formation_adresse_computed;
  let distance = oldFields?.distance;

  // ADRESSE

  if (
    fields.lieu_formation_geo_coordonnees &&
    (forceRecompute || fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnees)
  ) {
    try {
      const [latitude, longitude] = fields.lieu_formation_geo_coordonnees.split("##")[0]?.split(",");
      const { result } = (await getAddressFromCoordinates({ latitude, longitude })) ?? {};

      lieu_formation_adresse_computed = result?.adresse
        ? `${result.adresse.numero_voie} ${result.adresse.type_voie} ${result.adresse.nom_voie} ${result.adresse.code_postal} ${result.adresse.commune}`
        : undefined;
    } catch (e) {
      console.error(e);
      lieu_formation_adresse_computed = undefined;
    }
  }

  // GEOCOORDONNEES

  if (
    fields.lieu_formation_adresse &&
    fields.localite &&
    fields.code_postal &&
    fields.code_commune_insee &&
    (forceRecompute ||
      fields.lieu_formation_adresse !== oldFields?.lieu_formation_adresse ||
      fields.localite !== oldFields?.localite ||
      fields.code_postal !== oldFields?.code_postal ||
      fields.code_commune_insee !== oldFields?.code_commune_insee)
  ) {
    const addressData = {
      nom_voie: fields.lieu_formation_adresse,
      localite: fields.localite,
      code_postal: fields.code_postal,
      code_insee: fields.code_commune_insee,
    };

    try {
      const { result } = (await getCoordinatesFromAddressData(addressData)) ?? {};
      lieu_formation_geo_coordonnees_computed = result?.geo_coordonnees;
    } catch (e) {
      console.error(e);
      lieu_formation_geo_coordonnees_computed = undefined;
    }
  }

  // DISTANCE

  if (
    forceRecompute ||
    fields.lieu_formation_geo_coordonnees !== oldFields?.lieu_formation_geo_coordonnees ||
    lieu_formation_geo_coordonnees_computed !== oldFields?.lieu_formation_geo_coordonnees_computed
  ) {
    if (!!lieu_formation_geo_coordonnees_computed && !!fields.lieu_formation_geo_coordonnees) {
      const [lat1, lon1] = lieu_formation_geo_coordonnees_computed?.split("##")[0]?.split(",") ?? [];
      const [lat2, lon2] = fields.lieu_formation_geo_coordonnees?.split("##")[0]?.split(",") ?? [];

      distance = await distanceBetweenCoordinates(lat1, lon1, lat2, lon2);
    } else {
      distance = undefined;
    }
  }

  let partenaires = [];
  if (
    fields.etablissement_formateur_siret &&
    fields.etablissement_gestionnaire_siret &&
    fields.rncp_details?.partenaires &&
    (forceRecompute ||
      fields?.etablissement_formateur_siret !== oldFields?.etablissement_formateur_siret ||
      fields?.etablissement_gestionnaire_siret !== oldFields?.etablissement_gestionnaire_siret ||
      fields?.rncp_details?.partenaires !== oldFields?.rncp_details?.partenaires)
  ) {
    partenaires = (fields?.rncp_details?.partenaires ?? []).filter(({ Siret_Partenaire }) =>
      [fields?.etablissement_gestionnaire_siret, fields?.etablissement_formateur_siret].includes(Siret_Partenaire)
    );
  }

  const cfd_entree = getCfdEntree(fields.cfd);
  const cfd_entree_date_fermeture = await getCfdEntreeDateFermeture(fields.cfd);

  const campagneStartDate = await getCampagneStartDate();

  const parcoursup_publication_auto = [PARCOURSUP_STATUS.PUBLIE, PARCOURSUP_STATUS.PRET_POUR_INTEGRATION].includes(
    oldFields?.parcoursup_statut
  )
    ? oldFields?.updates_history?.filter(
        (history) =>
          history?.to?.parcoursup_statut === PARCOURSUP_STATUS.PRET_POUR_INTEGRATION &&
          new Date(history.updated_at).getTime() >= campagneStartDate.getTime()
      ).length === 0
    : null;

  const affelnet_publication_auto = [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION].includes(
    oldFields?.affelnet_statut
  )
    ? oldFields?.updates_history?.filter(
        (history) =>
          history?.to?.affelnet_statut === AFFELNET_STATUS.PRET_POUR_INTEGRATION &&
          new Date(history.updated_at).getTime() >= campagneStartDate.getTime()
      ).length === 0
    : null;

  // Les MEF permettant une intégration SLA :
  // [3 premiers caractères]..[2 derniers caractères]
  // 247..31
  // 276..31
  // 241..21
  // 242..31
  // 271..21
  const affelnet_perimetre_prise_rdv =
    [AFFELNET_STATUS.PUBLIE, AFFELNET_STATUS.PRET_POUR_INTEGRATION, AFFELNET_STATUS.A_PUBLIER].includes(
      oldFields?.affelnet_statut
    ) &&
    !!affelnet_mefs_10.filter((mef) => {
      return (
        (mef.mef10.startsWith("247") && mef.mef10.endsWith("31")) ||
        (mef.mef10.startsWith("276") && mef.mef10.endsWith("31")) ||
        (mef.mef10.startsWith("241") && mef.mef10.endsWith("21")) ||
        (mef.mef10.startsWith("242") && mef.mef10.endsWith("31")) ||
        (mef.mef10.startsWith("271") && mef.mef10.endsWith("21"))
      );
    }).length;

  const parcoursup_perimetre_prise_rdv = [PARCOURSUP_STATUS.PUBLIE].includes(oldFields?.parcoursup_statut);

  const nouvelle_fiche =
    !oldFields || new Date(oldFields?.created_at).getTime() >= campagneStartDate.getTime() - 365 * 24 * 60 * 60 * 1000;

  // Les formations relevant du ministère de l'agriculture sont celles dont le code CFD comporte un 3 en 3ème position.
  const agriculture = !!fields?.cfd?.match(/^..3.*/);

  let cle_me_link;

  switch (true) {
    case fields?.cle_me_remplace?.length > 0 && fields?.cle_me_remplace_par?.length > 0:
      cle_me_link = "Successeur et prédécesseur";
      break;
    case fields?.cle_me_remplace_par?.length > 0:
      cle_me_link = "Prédécesseur";
      break;
    case fields?.cle_me_remplace?.length > 0:
      cle_me_link = "Successeur";
      break;
    default:
      cle_me_link = "Aucun";
      break;
  }

  const etablissement_gestionnaire_raison_sociale_enseigne = `${fields.etablissement_gestionnaire_entreprise_raison_sociale}${fields.etablissement_gestionnaire_enseigne && fields.etablissement_gestionnaire_enseigne !== fields.etablissement_gestionnaire_entreprise_raison_sociale ? ` (${fields.etablissement_gestionnaire_enseigne})` : ""}`;
  const etablissement_formateur_raison_sociale_enseigne = `${fields.etablissement_formateur_entreprise_raison_sociale}${fields.etablissement_formateur_enseigne && fields.etablissement_formateur_enseigne !== fields.etablissement_formateur_entreprise_raison_sociale ? ` (${fields.etablissement_formateur_enseigne})` : ""}`;

  return {
    ...fields,

    bcn_mefs_10,
    affelnet_mefs_10,
    affelnet_infos_offre,
    parcoursup_mefs_10,
    duree_incoherente,
    annee_incoherente,
    distance_lieu_formation_etablissement_formateur,
    uai_formation,
    uai_formation_valide,

    distance,
    lieu_formation_geo_coordonnees_computed,
    lieu_formation_adresse_computed,

    cfd_entree,
    cfd_entree_date_fermeture,
    // ...(await computeRelationFields(fields)),

    partenaires,

    parcoursup_publication_auto,
    affelnet_publication_auto,
    parcoursup_perimetre_prise_rdv,
    affelnet_perimetre_prise_rdv,

    nouvelle_fiche,

    agriculture,

    cle_me_link,

    etablissement_gestionnaire_raison_sociale_enseigne,
    etablissement_formateur_raison_sociale_enseigne,
  };
};

/**
 *
 */
const removeFields = (entity, fields) => {
  fields.forEach((field) => {
    delete entity[field];
  });

  return entity;
};

const unpublishOthers = async ({ filter = {} } = { filter: {} }) => {
  let removed = 0;

  const cles = await DualControlFormation.distinct("cle_ministere_educatif");

  await cursor(
    Formation.find({
      $and: [{ cle_ministere_educatif: { $nin: cles } }, { ...filter }],
    }).select({ cle_ministere_educatif: 1 }),
    async ({ cle_ministere_educatif }) => {
      await Formation.updateOne({ cle_ministere_educatif }, { published: false });
      removed++;
    }
  );

  return { removed };
};

const applyConversion = async (
  { forceRecompute = false, skip = 0, filter = {} } = { forceRecompute: false, skip: 0, filter: {} }
) => {
  let dcFilter = Object.entries(filter).length
    ? {
        cle_ministere_educatif: {
          $in: (await Formation.find(filter).select({ cle_ministere_educatif: 1 })).map(
            (formation) => formation.cle_ministere_educatif
          ),
        },
      }
    : {};

  if (Object.entries(dcFilter).length) {
    console.log(`Applying conversion for ${dcFilter.cle_ministere_educatif.$in.length} formations`);
  }

  let added = 0,
    notUpdated = 0,
    updated = 0;

  await cursor(
    DualControlFormation.find({ ...dcFilter })
      .sort()
      .skip(skip),

    async ({ cle_ministere_educatif }) => {
      const dcFormation = await DualControlFormation.findOne({ cle_ministere_educatif }).lean();
      const formation = await Formation.findOne({ cle_ministere_educatif }).lean();

      // console.log("================================");
      // console.log({ cle_ministere_educatif, formation, dcFormation });
      // console.log("================================");

      // Si la formation existe
      if (formation) {
        const notToCompare = [
          "_id",
          "__v",
          "created_at",
          "updated_at",
          "last_updated_at",
          "lieu_formation_adresse_computed",
          "lieu_formation_geo_coordonnees_computed",
        ];

        const result = await Formation.updateOne(
          { cle_ministere_educatif },
          {
            $set: {
              ...(await recomputeFields(removeFields({ ...dcFormation }, notToCompare), formation, { forceRecompute })),
            },
          },
          { timestamps: false }
        );

        if (result.nModified) {
          updated++;

          if (config.log?.level === "debug") {
            const newFormation = await Formation.findById(formation._id).lean();
            const differences = objectDiff(formation, newFormation);
            logger.debug({ type: "job" }, { cle_ministere_educatif, differences });
          }

          await Formation.updateOne({ cle_ministere_educatif }, { $set: {} });
        } else {
          notUpdated++;
        }
      }

      // Si la formation n'existe pas
      else {
        // console.info(`${dcFormation.cle_ministere_educatif} not found`);
        added++;

        await Formation.create(await recomputeFields(dcFormation, null, { forceRecompute }));
      }
    }
  );

  return { added, updated, notUpdated };
};

const converter = async (
  { forceRecompute = false, skip = 0, filter = {} } = {
    forceRecompute: false,
    skip: 0,
    filter: {},
  }
) => {
  let error = null;
  try {
    console.log(filter);
    const { added, updated, notUpdated } = await applyConversion({ forceRecompute, skip, filter });

    const { removed } = await unpublishOthers({ filter });

    console.log({ added, updated, notUpdated, removed });
  } catch (e) {
    error = e;
    logger.error(
      {
        type: "job",
      },
      error
    );
  }

  return error;
};

module.exports = { converter, updateRelationFields };
