/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the Mongoose schema file,
 * To regenerate this file run $> yarn doc
 */
const { Types } = require("mongoose");

export interface AffelnetFormation {
  /**
   * Clé unique de la formation (pour envoi aux ministères éducatifs)
   */
  cle_ministere_educatif?: string;
  /**
   * uai de l'établissement de formation
   */
  uai?: string;
  /**
   * libellé du type de l'établissement (centre de formation d'apprentis, lycée, etc..) de formation
   */
  libelle_type_etablissement?: string;
  /**
   * libellé nom de l'établissement de formation
   */
  libelle_etablissement?: string;
  /**
   * numéro et adresse de l'établissement de formation
   */
  adresse?: string;
  /**
   * code postal de l'établissement de formation
   */
  code_postal?: string;
  /**
   * commune de l'établissement de formation
   */
  commune?: string;
  /**
   * Téléphone de l'établissement de formation
   */
  telephone?: string;
  /**
   * email de l'établissement de formation
   */
  email?: string;
  /**
   * nom de l'academie de l'établissement de formation
   */
  academie?: string;
  /**
   * ministère auquel est rattaché l'établissement de formation
   */
  ministere?: string;
  /**
   * type d'établissement (Privée / Public)
   */
  etablissement_type?: string;
  /**
   * type de contrat pris en charge par l'établissement de formation
   */
  type_contrat?: string;
  /**
   * code du type de l'établissement de formation
   */
  code_type_etablissement?: string;
  /**
   * code nature de l'établissement de formation
   */
  code_nature?: string;
  /**
   * code district de l'établissement de formation
   */
  code_district?: string;
  /**
   * code bassin de l'établissement de formation
   */
  code_bassin?: string;
  /**
   * code cio
   */
  cio?: string;
  /**
   * l'établissement propose un internat
   */
  internat?: boolean & string;
  /**
   * L'établissement fait partie du réseau ambition réussite
   */
  reseau_ambition_reussite?: boolean & string;
  /**
   * libellé mnémonique de la formation
   */
  libelle_mnemonique?: string;
  /**
   * code spécialité de la formation
   */
  code_specialite?: string;
  /**
   * libellé BAN de la formation
   */
  libelle_ban?: string;
  /**
   * code MEF de la formation
   */
  code_mef?: string;
  /**
   * code voie de la formation
   */
  code_voie?: string;
  /**
   * type de voie de la formation
   */
  type_voie?: string;
  /**
   * saisie possible depuis la 3ème année de collège
   */
  saisie_possible_3eme?: boolean & string;
  /**
   * saisie reservé au filière SEGPA
   */
  saisie_reservee_segpa?: boolean & string;
  /**
   * saisie possible depuis la 2nde (1ère année de lycée)
   */
  saisie_possible_2nde?: boolean & string;
  /**
   * formation affiché dans le TSA
   */
  visible_tsa?: boolean & string;
  /**
   * libellé affiché dans le sa
   */
  libelle_formation?: string;
  /**
   * url description formation onisep
   */
  url_onisep_formation?: string;
  /**
   * Libellé long de l'établissement délivrant la formation
   */
  libelle_etablissement_tsa?: string;
  /**
   * url description établissement onisep
   */
  url_onisep_etablissement?: string;
  /**
   * ville de l'établissement
   */
  ville?: string;
  /**
   * campus métier
   */
  campus_metier?: boolean & string;
  /**
   * condition particulière
   */
  modalites?: boolean & string;
  /**
   * coordonnées latitude de l'établissement
   */
  coordonnees_gps_latitude?: string;
  /**
   * coordonnées longitude de l'établissement
   */
  coordonnees_gps_longitude?: string;
  /**
   * tableau des matching des formations catalogue
   */
  matching_mna_formation?: unknown[];
  /**
   * force du matching
   */
  matching_type?: string;
  _id?: Types.ObjectId;
}