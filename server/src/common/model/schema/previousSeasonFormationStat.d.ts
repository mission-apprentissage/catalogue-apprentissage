/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the Mongoose schema file,
 * To regenerate this file run $> yarn doc
 */
const { Types } = require("mongoose");

export interface PreviousSeasonFormationStat {
  /**
   * Plateforme pour laquelle la formation était dans le périmètre
   */
  plateforme: "affelnet" | "parcoursup";
  /**
   * Date de la statistique
   */
  date: Date;
  /**
   * Causes de disparition du périmètre par académie
   */
  vanishing_scope_causes: {
    [k: string]: unknown;
  };
  _id?: Types.ObjectId;
}