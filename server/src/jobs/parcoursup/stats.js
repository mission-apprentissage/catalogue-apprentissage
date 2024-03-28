const { runScript } = require("../scriptWrapper");

const { PARCOURSUP_STATUS } = require("../../constants/status");
const { ConsoleStat, Formation } = require("../../common/model");
const { academies } = require("../../constants/academies");
const logger = require("../../common/logger");

const computeStats = async (academie = null) => {
  const globalFilter = { published: true };
  const scopeFilter = academie ? { nom_academie: academie } : {};
  // const scopeLog = academie ? `[${academie}]` : `[global]`;

  const filterPublie = {
    ...globalFilter,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    ...scopeFilter,
  };
  const filterPublieSansSession = {
    ...filterPublie,
    parcoursup_session: false,
  };

  const filterPublieSansSessionAvecRemplacement = {
    ...filterPublieSansSession,
    "cle_me_remplace_par.0": { $exists: true },
  };
  const filterPublieSansSessionSansRemplacement = {
    ...filterPublieSansSession,
    "cle_me_remplace_par.0": { $exists: false },
  };
  const filterPubliePerteQualiopi = {
    ...filterPublie,
    etablissement_gestionnaire_certifie_qualite: false,
  };

  const filterPublieSiretInactif = {
    ...filterPublie,
    siret_actif: "inactif",
  };
  const filterPubliePerteRncp = {
    ...filterPublie,
    etablissement_reference_habilite_rncp: false,
  };

  const filterIntegrable = {
    ...globalFilter,
    parcoursup_statut: { $ne: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT },
    ...scopeFilter,
  };
  const filterPerimetre = {
    ...globalFilter,
    parcoursup_perimetre: true,
    ...scopeFilter,
  };

  const formations_publiees = await Formation.countDocuments(filterPublie);
  // console.log(`${scopeLog} Formations publiées : ${formations_publiees}`);

  const formations_publiees_sans_session = await Formation.countDocuments(filterPublieSansSession);
  // console.log(`${scopeLog} Formations publiées ayant perdu sa session: ${filterPublieSansSession}`);

  const formations_publiees_sans_session_avec_remplacement = await Formation.countDocuments(
    filterPublieSansSessionAvecRemplacement
  );
  // console.log(`${scopeLog} Formations publiées ayant perdu sa session avec remplacement: ${filterPublieSansSessionAvecRemplacement}`);

  const formations_publiees_sans_session_sans_remplacement = await Formation.countDocuments(
    filterPublieSansSessionSansRemplacement
  );
  // console.log(`${scopeLog} Formations publiées ayant perdu sa session sans remplacement: ${filterPublieSansSessionSansRemplacement}`);

  const formations_publiees_perte_qualiopi = await Formation.countDocuments(filterPubliePerteQualiopi);
  // console.log(`${scopeLog} Formations publiées ayant perdu qualiopi: ${filterPubliePerteQualiopi}`);

  const formations_publiees_siret_inactif = await Formation.countDocuments(filterPublieSiretInactif);
  // console.log(`${scopeLog} Formations publiées dont le siret est devenu inactif: ${filterPublieSiretInactif}`);

  const formations_publiees_perte_rncp = await Formation.countDocuments(filterPubliePerteRncp);
  // console.log(`${scopeLog} Formations publiées ayant subi une perte d'habilitation rncp: ${filterPubliePerteRncp}`);

  const formations_integrables = await Formation.countDocuments(filterIntegrable);
  // console.log(`${scopeLog} Formations intégrables : ${formations_integrables}`);

  const formations_perimetre = await Formation.countDocuments(filterPerimetre);
  // console.log(`${scopeLog} Formations dans le périmètre : ${formations_integrables}`);

  const organismes_gestionnaires_avec_formations_publiees = await Formation.distinct(
    "etablissement_gestionnaire_id",
    filterPublie
  );
  const organismes_formateurs_avec_formations_publiees = await Formation.distinct(
    "etablissement_formateur_id",
    filterPublie
  );

  const organismes_avec_formations_publiees = [
    ...new Set([
      ...organismes_gestionnaires_avec_formations_publiees,
      ...organismes_formateurs_avec_formations_publiees,
    ]),
  ].length;

  // console.log(`${scopeLog} Organismes avec formations publiées : ${organismes_avec_formations_publiees}`);

  const organismes_gestionnaires_avec_formations_publiees_sans_session = await Formation.distinct(
    "etablissement_gestionnaire_id",
    filterPublieSansSession
  );
  const organismes_formateurs_avec_formations_publiees_sans_session = await Formation.distinct(
    "etablissement_formateur_id",
    filterPublieSansSession
  );

  const organismes_avec_formations_publiees_sans_session = [
    ...new Set([
      ...organismes_gestionnaires_avec_formations_publiees_sans_session,
      ...organismes_formateurs_avec_formations_publiees_sans_session,
    ]),
  ].length;

  // console.log(`${scopeLog} Organismes avec formations publiées ayant perdu sa session : ${organismes_avec_formations_publiees_sans_session}`);

  const organismes_gestionnaires_avec_formations_integrables = await Formation.distinct(
    "etablissement_gestionnaire_id",
    filterIntegrable
  );
  const organismes_formateurs_avec_formations_integrables = await Formation.distinct(
    "etablissement_formateur_id",
    filterIntegrable
  );

  const organismes_avec_formations_integrables = [
    ...new Set([
      ...organismes_gestionnaires_avec_formations_integrables,
      ...organismes_formateurs_avec_formations_integrables,
    ]),
  ].length;

  // console.log(`${scopeLog} Organismes avec formations intégrables : ${organismes_avec_formations_integrables}`);

  const organismes_gestionnaires_avec_formations_perimetre = await Formation.distinct(
    "etablissement_gestionnaire_id",
    filterPerimetre
  );
  const organismes_formateurs_avec_formations_perimetre = await Formation.distinct(
    "etablissement_formateur_id",
    filterPerimetre
  );

  const organismes_avec_formations_perimetre = [
    ...new Set([
      ...organismes_gestionnaires_avec_formations_perimetre,
      ...organismes_formateurs_avec_formations_perimetre,
    ]),
  ].length;

  // console.log(`${scopeLog} Organismes avec formations dans le périmètre : ${organismes_avec_formations_perimetre}`);

  const details = (
    await Promise.all(
      Object.values(PARCOURSUP_STATUS).flatMap(async (value) => ({
        [value]: await Formation.countDocuments({ ...globalFilter, parcoursup_statut: value, ...scopeFilter }),
      }))
    )
  ).reduce(function (result, current) {
    return Object.assign(result, current);
  }, {});

  return {
    academie,
    formations_publiees,
    formations_publiees_sans_session,
    formations_publiees_sans_session_avec_remplacement,
    formations_publiees_sans_session_sans_remplacement,
    formations_publiees_perte_qualiopi,
    formations_publiees_perte_rncp,
    formations_publiees_siret_inactif,
    formations_integrables,
    formations_perimetre,
    organismes_avec_formations_publiees,
    organismes_avec_formations_publiees_sans_session,
    organismes_avec_formations_integrables,
    organismes_avec_formations_perimetre,
    details,
  };
};

/**
 * Calcul des statistiques Parcoursup à destination des consoles de pilotages
 */
const psConsoleStats = async () => {
  logger.info({ type: "job" }, " -- PARCOURSUP STATISTIQUES : ⏳ -- ");
  const date = new Date();

  await Promise.all(
    [null, ...Object.values(academies).map((academie) => academie.nom_academie)].map(async (academie) => {
      const stats = await computeStats(academie);
      return await ConsoleStat.create({ plateforme: "parcoursup", date, ...stats });
    })
  );
  logger.info({ type: "job" }, " -- PARCOURSUP STATISTIQUES : ✅ -- ");
};

module.exports = { psConsoleStats };

if (process.env.standalone) {
  runScript(async () => {
    await psConsoleStats();
  });
}
