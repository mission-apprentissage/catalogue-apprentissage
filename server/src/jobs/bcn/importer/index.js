const logger = require("../../../common/logger");
const { asyncForEach } = require("../../../common/utils/asyncUtils");
const { runScript } = require("../../scriptWrapper");
const fileManager = require("./FileManager");
const createBcnFormation = require("./createBcnFormation");
const updateBcnFormation = require("./updateBcnFormation");
const {
  BcnFormationDiplome,
  BcnLettreSpecialite,
  BcnNNiveauFormationDiplome,
  BcnNMef,
  BcnNDispositifFormation,
} = require("../../../common/models");

const mergeNformationVformation = (N_FORMATION_DIPLOME, V_FORMATION_DIPLOME) => {
  const bcnFormations = new Map();
  for (let ite = 0; ite < N_FORMATION_DIPLOME.length; ite++) {
    const nFormation = N_FORMATION_DIPLOME[ite];
    bcnFormations.set(nFormation.FORMATION_DIPLOME, nFormation);
  }
  for (let ite = 0; ite < V_FORMATION_DIPLOME.length; ite++) {
    const vFormation = V_FORMATION_DIPLOME[ite];
    const existInNFormation = bcnFormations.get(vFormation.FORMATION_DIPLOME);
    if (!existInNFormation) {
      bcnFormations.set(vFormation.FORMATION_DIPLOME, vFormation);
    }
  }
  return Array.from(bcnFormations.values());
};

const dbOperations = async (base, db, Entity, description = "", identity) => {
  try {
    await asyncForEach(base, async (item) => {
      const exist = await Entity.findOne({ [identity]: item[identity] });
      if (exist) {
        await Entity.updateOne({ [identity]: item[identity] }, { ...item, last_update_at: Date.now() });
        logger.debug(`BCN ${description} '${item[identity]}' successfully updated in db ${db.name}`);
      } else {
        logger.debug(`BCN ${description}  '${item[identity]}' not found`);
        const bcnToAdd = new Entity(item);
        await bcnToAdd.save();
        logger.debug(`BCN ${description} '${item[identity]}' successfully added in db ${db.name}`);
      }
    });
    logger.info(`Importing BCN ${description} table Succeed`);
  } catch (error) {
    logger.error(`Importing BCN ${description} table Failed`);
  }
};

const importBcnTables = async (db = { name: "" }) => {
  logger.info(`[BCN tables] Importer`);
  const bases = fileManager.loadBases();

  const bcnFormations = mergeNformationVformation(bases.N_FORMATION_DIPLOME, bases.V_FORMATION_DIPLOME);

  try {
    await asyncForEach(bcnFormations, async (formation) => {
      const exist = await BcnFormationDiplome.findOne({ FORMATION_DIPLOME: formation.FORMATION_DIPLOME });
      if (exist) {
        await updateBcnFormation(db, exist._id, formation);
      } else {
        logger.debug(`BCN Formation '${formation.FORMATION_DIPLOME}' not found`);
        await createBcnFormation(db, formation);
      }
    });
    logger.info(`Importing BCN Formations table Succeed`);
  } catch (error) {
    logger.error(`Importing BCN Formations table Failed`);
  }

  // N_LETTRE_SPECIALITE
  await dbOperations(bases.N_LETTRE_SPECIALITE, db, BcnLettreSpecialite, "Lettre specialite", "LETTRE_SPECIALITE");

  // N_NIVEAU_FORMATION_DIPLOME
  await dbOperations(
    bases.N_NIVEAU_FORMATION_DIPLOME,
    db,
    BcnNNiveauFormationDiplome,
    "N Niveau formation",
    "NIVEAU_FORMATION_DIPLOME"
  );

  // N_MEF
  await dbOperations(bases.N_MEF, db, BcnNMef, "N Mef", "MEF");

  // N_DISPOSITIF_FORMATION
  await dbOperations(bases.N_DISPOSITIF_FORMATION, db, BcnNDispositifFormation, "N Dispositif", "DISPOSITIF_FORMATION");

  logger.info(`[BCN tables] Importer completed`);
};

module.exports.importBcnTables = importBcnTables;

if (process.env.standalone) {
  runScript(async ({ db }) => {
    await importBcnTables(db);
  });
}
