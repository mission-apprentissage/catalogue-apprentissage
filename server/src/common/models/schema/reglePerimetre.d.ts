/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the Mongoose schema file,
 * To regenerate this file run > yarn doc
 */
const { Types } = require("mongoose");

export interface ReglePerimetre {
  /**
   * Plateforme pour laquelle s'applique la règle
   */
  plateforme: "affelnet" | "parcoursup";
  /**
   * Niveau sur lequel s'applique la règle
   */
  niveau: "3 (CAP...)" | "4 (BAC...)" | "5 (BTS, DEUST...)" | "6 (Licence, BUT...)" | "7 (Master, titre ingénieur...)";
  /**
   * Diplôme sur lequel s'applique la règle
   */
  diplome: string | null;
  /**
   * Statut appliqué quand la formation matche la règle
   */
  statut:
    | "non publiable en l'état"
    | "publié"
    | "non publié"
    | "à publier"
    | "prêt pour intégration"
    | "à publier (vérifier accès direct postbac)"
    | "à publier (soumis à validation Recteur)"
    | "à publier (sous condition habilitation)"
    | "à publier (soumis à validation)";
  /**
   * Académie pour laquelle la règle a été créé si il y en a une
   */
  num_academie?: number;
  /**
   * Les statuts à appliquer pour cette règle en académies
   */
  statut_academies?: {
    [k: string]: unknown;
  };
  /**
   * La règle pour matcher les formations (i.e: query mongo) qui s'ajoute au niveau + diplome (stringified)
   */
  regle_complementaire?: string | null;
  /**
   * La règle complémentaire, de type eS pour le rule builder
   */
  regle_complementaire_query?: string | null;
  /**
   * Nom du sous-ensemble
   */
  nom_regle_complementaire?: string | null;
  /**
   * En cas d'égalité sur la plateforme, niveau et diplome, priorité de la règle pour savoir laquelle est la plus forte
   */
  priorite?: number;
  /**
   * Historique des mises à jours
   */
  updates_history?: unknown[];
  /**
   * Date de dernière mise à jour
   */
  last_update_at?: Date;
  /**
   * Qui a réalisé la dernière modification
   */
  last_update_who?: string | null;
  /**
   * True si la règle a été supprimée (soft delete)
   */
  is_deleted?: boolean;
  /**
   * Condition d'intégration dans la plateforme
   */
  condition_integration: "doit intégrer" | "peut intégrer" | "ne doit pas intégrer";
  /**
   * Durée en années pour matcher les formations
   */
  duree?: string | null;
  /**
   * Année d'inscription de la formation
   */
  annee?: string | null;
  _id?: Types.ObjectId;
  updated_at?: Date;
  created_at?: Date;
}
