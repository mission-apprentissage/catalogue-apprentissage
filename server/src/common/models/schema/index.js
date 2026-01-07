const affelnetFormationSchema = require("./affelnetFormation");
const alertSchema = require("./alert");
const campagneStartSchema = require("./campagneStart");
const candidatureFormationSchema = require("./candidatureFormation");
const candidatureRelationSchema = require("./candidatureRelation");
const consoleStatSchema = require("./consoleStat");
const consumptionSchema = require("./consumption");
const dualControlEtablissementSchema = require("./dualControlEtablissement");
const dualControlFormationSchema = require("./formation/dualControlFormation");
const etablissementSchema = require("./etablissement");
const formationSchema = require("./formation/formation");
const logSchema = require("./log");
const parcoursupFormationCheckSchema = require("./parcoursupFormationCheck");
const parcoursupFormationSchema = require("./parcoursupFormation");
const previousSeasonFormationSchema = require("./previousSeasonFormation");
const previousSeasonFormationStatSchema = require("./previousSeasonFormationStat");
const reglePerimetreSchema = require("./reglePerimetre");
const relationSchema = require("./relation");
const roleSchema = require("./role");
const statistiqueSchema = require("./statistique");
const userSchema = require("./user");

const bcnFormationDiplomesSchema = require("./bcnFormationDiplomes");
const bcnLettreSpecialiteSchema = require("./bcnLettreSpecialite");
const bcnNNiveauFormationDiplomeSchema = require("./bcnNNiveauFormationDiplome");
const bcnNMefSchema = require("./bcnNMef");
const bcnNDispositifFormationSchema = require("./bcnNDispositifFormation");

const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const schemasMap = new Map(
  Object.entries({
    bcnFormationDiplomes: [bcnFormationDiplomesSchema, {}],
    bcnLettreSpecialite: [bcnLettreSpecialiteSchema, {}],
    bcnNNiveauFormationDiplome: [bcnNNiveauFormationDiplomeSchema, {}],
    bcnNMef: [bcnNMefSchema, {}],
    bcnNDispositifFormation: [bcnNDispositifFormationSchema, {}],

    affelnetFormation: [affelnetFormationSchema, { timestamps }],
    alert: [alertSchema, { timestamps }],
    campagneStart: [campagneStartSchema, { timestamps }],
    candidatureFormation: [candidatureFormationSchema, { timestamps }],
    candidatureRelation: [candidatureRelationSchema, { timestamps }],
    consoleStat: [consoleStatSchema, {}],
    consumption: [consumptionSchema, {}],
    dualControlEtablissement: [dualControlEtablissementSchema, {}],
    dualControlFormation: [dualControlFormationSchema, {}],
    etablissement: [etablissementSchema, { timestamps }],
    formation: [formationSchema, { timestamps }],
    log: [logSchema, {}],
    parcoursupFormation: [parcoursupFormationSchema, { timestamps }],
    parcoursupFormationCheck: [parcoursupFormationCheckSchema, {}],
    previousSeasonFormation: [previousSeasonFormationSchema, {}],
    previousSeasonFormationStat: [previousSeasonFormationStatSchema, {}],
    reglePerimetre: [reglePerimetreSchema, { timestamps }],
    relation: [relationSchema, { timestamps }],
    role: [roleSchema, { timestamps }],
    statistique: [statistiqueSchema, { timestamps }],
    user: [userSchema, { timestamps }],
  })
);

module.exports = schemasMap;
