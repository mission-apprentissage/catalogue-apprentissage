module.exports = {
  etablissement: {
    title: "etablissement",
    properties: {
      siege_social: {
        type: "boolean",
        description: "Cet établissement est le siége sociale",
      },
      etablissement_siege_id: {
        type: "string",
        description: "Identifiant établissement siége",
      },
      etablissement_siege_siret: {
        type: "string",
        description: "Numéro siret du siége sociale",
      },
      siret: {
        type: "string",
        description: "Numéro siret",
      },
      siren: {
        type: "string",
        description: "Numéro siren de l'entreprise",
      },
      nda: {
        type: "string",
        description: "Numéro Déclaration",
      },
      naf_code: {
        type: "string",
        description: "Code NAF",
      },
      naf_libelle: {
        type: "string",
        description: "Libellé du code NAT (ex: Enseignement secondaire technique ou professionnel)",
      },
      tranche_effectif_salarie: {
        type: "object",
        description: "Tranche salariale",
        properties: {},
      },
      date_creation: {
        type: "string",
        description: "Date de création",
        format: "date-time",
      },
      date_mise_a_jour: {
        type: "string",
        description: "Date de création",
        format: "date-time",
      },
      diffusable_commercialement: {
        type: "boolean",
        description: "Diffusable commercialement",
      },
      enseigne: {
        type: "string",
        description: "Enseigne",
      },
      raison_sociale_enseigne: {
        type: "string",
        description: "Raison social et enseigne (pour recherche)",
      },
      onisep_nom: {
        type: "string",
        description: "Nom de l'etablissement Onisep",
      },
      onisep_url: {
        type: "string",
        description: "Url Onisep de la fiche etablissement",
      },
      onisep_code_postal: {
        type: "string",
        description: "Code postal Onisep",
      },
      adresse: {
        type: "string",
        description: "Adresse de l'établissement",
      },
      numero_voie: {
        type: "string",
        description: "Numéro de la voie",
      },
      type_voie: {
        type: "string",
        description: "Type de voie (ex: rue, avenue)",
      },
      nom_voie: {
        type: "string",
        description: "Nom de la voie",
      },
      complement_adresse: {
        type: "string",
        description: "Complément d'adresse de l'établissement",
      },
      code_postal: {
        type: "string",
        description: "Code postal",
      },
      num_departement: {
        type: "string",
        description: "Numéro de département",
      },
      nom_departement: {
        type: "string",
        description: "Nom du departement",
      },
      localite: {
        type: "string",
        description: "Localité",
      },
      code_insee_localite: {
        type: "string",
        description: "Code Insee localité",
      },
      cedex: {
        type: "string",
        description: "Cedex",
      },
      geo_coordonnees: {
        type: "string",
        description: "Latitude et longitude de l'établissement",
      },
      date_fermeture: {
        type: "string",
        description: "Date de cessation d'activité",
        format: "date-time",
      },
      ferme: {
        type: "boolean",
        description: "A cessé son activité",
      },
      region_implantation_code: {
        type: "string",
        description: "Code région",
      },
      region_implantation_nom: {
        type: "string",
        description: "Nom de la région",
      },
      commune_implantation_code: {
        type: "string",
        description: "Code commune",
      },
      commune_implantation_nom: {
        type: "string",
        description: "Nom de la commune",
      },
      pays_implantation_code: {
        type: "string",
        description: "Code pays",
      },
      pays_implantation_nom: {
        type: "string",
        description: "Nom du pays",
      },
      num_academie: {
        type: "number",
        description: "Numéro de l'académie",
      },
      nom_academie: {
        type: "string",
        description: "Nom de l'académie",
      },
      uai: {
        type: "string",
        description: "UAI de l'établissement",
      },
      uai_valide: {
        type: "boolean",
        description: "L'UAI de l'établissement est il valide ?",
      },
      uais_potentiels: {
        type: "array",
        description: "UAIs potentiels de l'établissement",
        items: {
          type: "string",
        },
      },
      info_datagouv_ofs: {
        type: "number",
        description: "L'établissement est présent ou pas dans le fichier datagouv",
      },
      info_datagouv_ofs_info: {
        type: "string",
        description: "L'établissement est présent ou pas dans le fichier datagouv",
      },
      info_qualiopi_info: {
        type: "string",
        description: "L'établissement est présent ou pas dans le fichier qualiopi",
      },
      api_entreprise_reference: {
        type: "boolean",
        description: "L'établissement est trouvé via l'API Entreprise",
      },
      entreprise_siren: {
        type: "string",
        description: "Numéro siren",
      },
      entreprise_procedure_collective: {
        type: "boolean",
        description: "Procédure collective",
      },
      entreprise_enseigne: {
        type: "string",
        description: "Enseigne",
      },
      entreprise_numero_tva_intracommunautaire: {
        type: "string",
        description: "Numéro de TVA intracommunautaire",
      },
      entreprise_code_effectif_entreprise: {
        type: "string",
        description: "Code éffectf",
      },
      entreprise_forme_juridique_code: {
        type: "string",
        description: "Code forme juridique",
      },
      entreprise_forme_juridique: {
        type: "string",
        description: "Forme juridique (ex: Établissement public local d'enseignement)",
      },
      entreprise_raison_sociale: {
        type: "string",
        description: "Raison sociale",
      },
      entreprise_nom_commercial: {
        type: "string",
        description: "Nom commercial",
      },
      entreprise_capital_social: {
        type: "string",
        description: "Capital social",
      },
      entreprise_date_creation: {
        type: "string",
        description: "Date de création",
        format: "date-time",
      },
      entreprise_date_radiation: {
        type: "string",
        description: "Date de radiation",
      },
      entreprise_naf_code: {
        type: "string",
        description: "Code NAF",
      },
      entreprise_naf_libelle: {
        type: "string",
        description: "Libellé du code NAT (ex: Enseignement secondaire technique ou professionnel)",
      },
      entreprise_date_fermeture: {
        type: "string",
        description: "Date de cessation d'activité",
        format: "date-time",
      },
      entreprise_ferme: {
        type: "boolean",
        description: "A cessé son activité",
      },
      entreprise_siret_siege_social: {
        type: "string",
        description: "Numéro siret du siége sociale",
      },
      entreprise_nom: {
        type: "string",
        description: "Nom du contact",
      },
      entreprise_prenom: {
        type: "string",
        description: "Prénom du contact",
      },
      entreprise_categorie: {
        type: "string",
        description: "Catégorie (PME, TPE, etc..)",
      },
      entreprise_tranche_effectif_salarie: {
        type: "object",
        description: "Tranche salarié",
        properties: {},
      },
      formations_ids: {
        type: "array",
        description: "Id des formations rattachées",
        items: {
          type: "string",
        },
      },
      formations_uais: {
        type: "array",
        description: "UAIs des formations rattachées à l'établissement",
        items: {
          type: "string",
        },
      },
      ds_id_dossier: {
        type: "string",
        description: "Numéro de dossier Démarche Simplifiée",
      },
      ds_questions_siren: {
        type: "string",
        description: "Numéro SIREN saisi dans Démarche Simplifiée",
      },
      ds_questions_nom: {
        type: "string",
        description: "Nom du contact saisi dans Démarche Simplifiée",
      },
      ds_questions_uai: {
        type: "string",
        description: "UAI saisi dans Démarche Simplifiée",
      },
      ds_questions_has_agrement_cfa: {
        type: "string",
        description: 'Réponse à la question "Avez vous l\'agrément CFA" dans Démarche Simplifiée',
      },
      ds_questions_has_certificaton_2015: {
        type: "string",
        description: 'Réponse à la question "Avez vous la certification 2015" dans Démarche Simplifiée',
      },
      ds_questions_has_ask_for_certificaton: {
        type: "string",
        description: 'Réponse à la question "Avez vous demandé la certification" dans Démarche Simplifiée',
      },
      ds_questions_ask_for_certificaton_date: {
        type: "string",
        description: 'Réponse à la question "Date de votre demande de certification" dans Démarche Simplifiée',
        format: "date-time",
      },
      ds_questions_declaration_code: {
        type: "string",
        description: 'Réponse à la question "Numéro de votre déclaration" dans Démarche Simplifiée',
      },
      ds_questions_has_2020_training: {
        type: "string",
        description: 'Réponse à la question "Proposez-vous des formations en 2020" dans Démarche Simplifiée',
      },
      certifie_qualite: {
        type: "boolean",
        description: "Possède la certification Qualité",
      },
      published: {
        type: "boolean",
        description: "Est publié",
      },
      tags: {
        type: "array",
        description: "Tableau de tags (2020, 2021, RCO, etc.)",
        items: {
          type: "string",
        },
      },
      rco_uai: {
        type: "string",
        description: "UAI de l'établissement RCO",
      },
      rco_adresse: {
        type: "string",
        description: "Adresse de l'établissement RCO ",
      },
      rco_code_postal: {
        type: "string",
        description: "Code postal",
      },
      rco_code_insee_localite: {
        type: "string",
        description: "Code Insee localité RCO",
      },
      rco_geo_coordonnees: {
        type: "string",
        description: "Latitude et longitude de l'établissement RCO",
      },
      idcc: {
        type: "number",
        description: "id convention collective",
      },
      opco_nom: {
        type: "string",
        description: "Nom de l'opérateur de compétence",
      },
      opco_siren: {
        type: "string",
        description: "Siren de l'opérateur de compétence",
      },
      email_direction: {
        type: "string",
        description: "Email de la direction de l'établissement",
      },
      editedFields: {
        type: "object",
        description: "Champs édités par un utilisateur",
        properties: {
          email_direction: {
            type: "string",
            description: "Email de la direction de l'établissement édité par un utilisateur",
          },
          _id: {
            type: "string",
          },
        },
      },
      updates_history: {
        type: "array",
        description: "Historique des mises à jours",
        items: {
          type: "object",
          properties: {
            from: {
              type: "object",
              description: "Valeurs avant mise à jour",
              properties: {},
            },
            to: {
              type: "object",
              description: "Valeurs après mise à jour",
              properties: {},
            },
          },
          required: [],
        },
      },
      last_update_at: {
        type: "string",
        description: "Date de dernières mise à jour",
        format: "date-time",
      },
      last_update_who: {
        type: "string",
        description: "Qui a réalisé la dernière modification",
      },
      _id: {
        type: "string",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
    },
  },
};
