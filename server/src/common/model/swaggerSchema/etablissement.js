module.exports = {
  etablissement: {
    type: "object",
    properties: {
      siege_social: {
        type: "boolean",
        default: false,
        description: "Cet établissement est le siége sociale",
      },
      etablissement_siege_id: {
        type: "string",
        default: "null",
        description: "Identifiant établissement siége",
      },
      etablissement_siege_siret: {
        type: "string",
        default: "null",
        description: "Numéro siret du siége sociale",
      },
      siret: {
        type: "string",
        default: "null",
        description: "Numéro siret",
      },
      siren: {
        type: "string",
        default: "null",
        description: "Numéro siren de l'entreprise",
      },
      nda: {
        type: "string",
        default: "null",
        description: "Numéro Déclaration",
      },
      naf_code: {
        type: "string",
        default: "null",
        description: "Code NAF",
      },
      naf_libelle: {
        type: "string",
        default: "null",
        description: "Libellé du code NAT (ex: Enseignement secondaire technique ou professionnel)",
      },
      tranche_effectif_salarie: {
        type: "object",
        description: "Tranche salariale",
      },
      date_creation: {
        type: "string",
        default: "null",
        description: "Date de création",
        format: "date-time",
      },
      date_mise_a_jour: {
        type: "string",
        default: "null",
        description: "Date de création",
        format: "date-time",
      },
      diffusable_commercialement: {
        type: "boolean",
        default: true,
        description: "Diffusable commercialement",
      },
      enseigne: {
        type: "string",
        default: "null",
        description: "Enseigne",
      },
      onisep_nom: {
        type: "string",
        default: "null",
        description: "Nom de l'etablissement Onisep",
      },
      onisep_url: {
        type: "string",
        default: "null",
        description: "Url Onisep de la fiche etablissement",
      },
      onisep_code_postal: {
        type: "string",
        default: "null",
        description: "Code postal Onisep",
      },
      adresse: {
        type: "string",
        default: "null",
        description: "Adresse de l'établissement",
      },
      numero_voie: {
        type: "string",
        default: "null",
        description: "Numéro de la voie",
      },
      type_voie: {
        type: "string",
        default: "null",
        description: "Type de voie (ex: rue, avenue)",
      },
      nom_voie: {
        type: "string",
        default: "null",
        description: "Nom de la voie",
      },
      complement_adresse: {
        type: "string",
        default: "null",
        description: "Complément d'adresse de l'établissement",
      },
      code_postal: {
        type: "string",
        default: "null",
        description: "Code postal",
      },
      num_departement: {
        type: "string",
        default: "null",
        description: "Numéro de département",
      },
      nom_departement: {
        type: "string",
        default: "null",
        description: "Nom du departement",
      },
      localite: {
        type: "string",
        default: "null",
        description: "Localité",
      },
      code_insee_localite: {
        type: "string",
        default: "null",
        description: "Code Insee localité",
      },
      cedex: {
        type: "string",
        default: "null",
        description: "Cedex",
      },
      geo_coordonnees: {
        type: "string",
        description: "Latitude et longitude de l'établissement",
      },
      date_fermeture: {
        type: "string",
        default: "null",
        description: "Date de cessation d'activité",
        format: "date-time",
      },
      ferme: {
        type: "boolean",
        default: false,
        description: "A cessé son activité",
      },
      region_implantation_code: {
        type: "string",
        default: "null",
        description: "Code région",
      },
      region_implantation_nom: {
        type: "string",
        default: "null",
        description: "Nom de la région",
      },
      commune_implantation_code: {
        type: "string",
        default: "null",
        description: "Code commune",
      },
      commune_implantation_nom: {
        type: "string",
        default: "null",
        description: "Nom de la commune",
      },
      pays_implantation_code: {
        type: "string",
        default: "null",
        description: "Code pays",
      },
      pays_implantation_nom: {
        type: "string",
        default: "null",
        description: "Nom du pays",
      },
      num_academie: {
        type: "number",
        default: 0,
        description: "Numéro de l'académie",
      },
      nom_academie: {
        type: "string",
        default: "null",
        description: "Nom de l'académie",
      },
      uai: {
        type: "string",
        default: "null",
        description: "UAI de l'établissement",
      },
      uais_potentiels: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
        description: "UAIs potentiels de l'établissement",
      },
      info_depp: {
        type: "number",
        default: 0,
        description: "L'établissement est présent ou pas dans le fichier DEPP",
      },
      info_dgefp: {
        type: "number",
        default: 0,
        description: "L'établissement est présent ou pas dans le fichier DGEFP",
      },
      info_datagouv_ofs: {
        type: "number",
        default: 0,
        description: "L'établissement est présent ou pas dans le fichier datagouv",
      },
      info_datadock: {
        type: "number",
        default: 0,
        description: "L'établissement est présent ou pas dans le fichier dataDock",
      },
      info_depp_info: {
        type: "string",
        default: "null",
        description: "L'établissement est présent ou pas dans le fichier DEPP",
      },
      info_dgefp_info: {
        type: "string",
        default: "null",
        description: "L'établissement est présent ou pas dans le fichier DGEFP",
      },
      info_datagouv_ofs_info: {
        type: "string",
        default: "null",
        description: "L'établissement est présent ou pas dans le fichier datagouv",
      },
      info_datadock_info: {
        type: "string",
        default: "null",
        description: "L'établissement est présent ou pas dans le fichier dataDock",
      },
      info_qualiopi_info: {
        type: "string",
        default: "null",
        description: "L'établissement est présent ou pas dans le fichier qualiopi",
      },
      computed_type: {
        type: "string",
        default: "null",
        description: "Type de l'établissement CFA ou OF",
      },
      computed_declare_prefecture: {
        type: "string",
        default: "null",
        description: "Etablissement est déclaré en prefecture",
      },
      computed_conventionne: {
        type: "string",
        default: "null",
        description: "Etablissement est conventionné ou pas",
      },
      computed_info_datadock: {
        type: "string",
        default: "null",
        description: "Etablissement est connu de datadock",
      },
      api_entreprise_reference: {
        type: "boolean",
        default: false,
        description: "L'établissement est trouvé via l'API Entreprise",
      },
      parcoursup_a_charger: {
        type: "boolean",
        default: false,
        description: "L'établissement doit être ajouter à ParcourSup",
      },
      affelnet_a_charger: {
        type: "boolean",
        default: false,
        description: "La formation doit être ajouter à affelnet",
      },
      entreprise_siren: {
        type: "string",
        default: "null",
        description: "Numéro siren",
      },
      entreprise_procedure_collective: {
        type: "boolean",
        default: false,
        description: "Procédure collective",
      },
      entreprise_enseigne: {
        type: "string",
        default: "null",
        description: "Enseigne",
      },
      entreprise_numero_tva_intracommunautaire: {
        type: "string",
        default: "null",
        description: "Numéro de TVA intracommunautaire",
      },
      entreprise_code_effectif_entreprise: {
        type: "string",
        default: "null",
        description: "Code éffectf",
      },
      entreprise_forme_juridique_code: {
        type: "string",
        default: "null",
        description: "Code forme juridique",
      },
      entreprise_forme_juridique: {
        type: "string",
        default: "null",
        description: "Forme juridique (ex: Établissement public local d'enseignement)",
      },
      entreprise_raison_sociale: {
        type: "string",
        default: "null",
        description: "Raison sociale",
      },
      entreprise_nom_commercial: {
        type: "string",
        default: "null",
        description: "Nom commercial",
      },
      entreprise_capital_social: {
        type: "string",
        default: "null",
        description: "Capital social",
      },
      entreprise_date_creation: {
        type: "string",
        default: "null",
        description: "Date de création",
        format: "date-time",
      },
      entreprise_date_radiation: {
        type: "string",
        default: "null",
        description: "Date de radiation",
      },
      entreprise_naf_code: {
        type: "string",
        default: "null",
        description: "Code NAF",
      },
      entreprise_naf_libelle: {
        type: "string",
        default: "null",
        description: "Libellé du code NAT (ex: Enseignement secondaire technique ou professionnel)",
      },
      entreprise_date_fermeture: {
        type: "string",
        default: "null",
        description: "Date de cessation d'activité",
        format: "date-time",
      },
      entreprise_ferme: {
        type: "boolean",
        default: false,
        description: "A cessé son activité",
      },
      entreprise_siret_siege_social: {
        type: "string",
        default: "null",
        description: "Numéro siret du siége sociale",
      },
      entreprise_nom: {
        type: "string",
        default: "null",
        description: "Nom du contact",
      },
      entreprise_prenom: {
        type: "string",
        default: "null",
        description: "Prénom du contact",
      },
      entreprise_categorie: {
        type: "string",
        default: "null",
        description: "Catégorie (PME, TPE, etc..)",
      },
      entreprise_tranche_effectif_salarie: {
        type: "object",
        description: "Tranche salarié",
      },
      formations_attachees: {
        type: "boolean",
        default: false,
        description: "l'établissement a des formations",
      },
      formations_ids: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
        description: "Id des formations rattachées",
      },
      formations_uais: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
        description: "UAIs des formations rattachées à l'établissement",
      },
      formations_n3: {
        type: "boolean",
        default: false,
        description: "l'établissement a des formations de niveau 3",
      },
      formations_n4: {
        type: "boolean",
        default: false,
        description: "l'établissement a des formations de niveau 4",
      },
      formations_n5: {
        type: "boolean",
        default: false,
        description: "l'établissement a des formations de niveau 5",
      },
      formations_n6: {
        type: "boolean",
        default: false,
        description: "l'établissement a des formations de niveau 6",
      },
      formations_n7: {
        type: "boolean",
        default: false,
        description: "l'établissement a des formations de niveau 7",
      },
      ds_id_dossier: {
        type: "string",
        default: "null",
        description: "Numéro de dossier Démarche Simplifiée",
      },
      ds_questions_siren: {
        type: "string",
        default: "null",
        description: "Numéro SIREN saisi dans Démarche Simplifiée",
      },
      ds_questions_nom: {
        type: "string",
        default: "null",
        description: "Nom du contact saisi dans Démarche Simplifiée",
      },
      ds_questions_uai: {
        type: "string",
        default: "null",
        description: "UAI saisi dans Démarche Simplifiée",
      },
      ds_questions_has_agrement_cfa: {
        type: "string",
        default: "null",
        description: 'Réponse à la question "Avez vous l\'agrément CFA" dans Démarche Simplifiée',
      },
      ds_questions_has_certificaton_2015: {
        type: "string",
        default: "null",
        description: 'Réponse à la question "Avez vous la certification 2015" dans Démarche Simplifiée',
      },
      ds_questions_has_ask_for_certificaton: {
        type: "string",
        default: "null",
        description: 'Réponse à la question "Avez vous demandé la certification" dans Démarche Simplifiée',
      },
      ds_questions_ask_for_certificaton_date: {
        type: "string",
        default: "null",
        description: 'Réponse à la question "Date de votre demande de certification" dans Démarche Simplifiée',
        format: "date-time",
      },
      ds_questions_declaration_code: {
        type: "string",
        default: "null",
        description: 'Réponse à la question "Numéro de votre déclaration" dans Démarche Simplifiée',
      },
      ds_questions_has_2020_training: {
        type: "string",
        default: "null",
        description: 'Réponse à la question "Proposez-vous des formations en 2020" dans Démarche Simplifiée',
      },
      catalogue_published: {
        type: "boolean",
        default: false,
        description: "Est publié dans le catalogue général",
      },
      published: {
        type: "boolean",
        default: false,
        description: "Est publié",
      },
      created_at: {
        type: "string",
        description: "Date d'ajout en base de données",
        format: "date-time",
      },
      last_update_at: {
        type: "string",
        description: "Date de dernières mise à jour",
        format: "date-time",
      },
      updates_history: {
        type: "array",
        items: {},
        default: [],
        description: "Historique des mises à jours",
      },
      update_error: {
        type: "string",
        default: "null",
        description: "Erreur lors de la mise à jour de la formation",
      },
      tags: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
        description: "Tableau de tags (2020, 2021, RCO, etc.)",
      },
      rco_uai: {
        type: "string",
        default: "null",
        description: "UAI de l'établissement RCO",
      },
      rco_adresse: {
        type: "string",
        default: "null",
        description: "Adresse de l'établissement RCO ",
      },
      rco_code_postal: {
        type: "string",
        default: "null",
        description: "Code postal",
      },
      rco_code_insee_localite: {
        type: "string",
        default: "null",
        description: "Code Insee localité RCO",
      },
      rco_geo_coordonnees: {
        type: "string",
        description: "Latitude et longitude de l'établissement RCO",
      },
      idcc: {
        type: "number",
        default: 0,
        description: "id convention collective",
      },
      opco_nom: {
        type: "string",
        default: "null",
        description: "Nom de l'opérateur de compétence",
      },
      opco_siren: {
        type: "string",
        default: "null",
        description: "Siren de l'opérateur de compétence",
      },
      _id: {
        type: "string",
        pattern: "^[0-9a-fA-F]{24}$",
      },
    },
  },
};
