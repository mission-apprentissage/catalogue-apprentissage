module.exports = {
  mnaFormation: {
    type: "object",
    properties: {
      etablissement_gestionnaire_id: {
        type: "string",
        default: "null",
        description: "Identifiant établissement gestionnaire",
      },
      etablissement_gestionnaire_siret: {
        type: "string",
        default: "null",
        description: "Numéro siret gestionnaire",
      },
      etablissement_gestionnaire_enseigne: {
        type: "string",
        default: "null",
        description: "Enseigne établissement gestionnaire",
      },
      etablissement_gestionnaire_uai: {
        type: "string",
        default: "null",
        description: "UAI de l'etablissement gestionnaire",
      },
      etablissement_gestionnaire_type: {
        type: "string",
        default: "null",
        description: "Etablissement gestionnaire est un CFA ou un OF",
      },
      etablissement_gestionnaire_conventionne: {
        type: "string",
        default: "null",
        description: "Etablissement gestionnaire est conventionné ou pas",
      },
      etablissement_gestionnaire_declare_prefecture: {
        type: "string",
        default: "null",
        description: "Etablissement gestionnaire est déclaré en prefecture",
      },
      etablissement_gestionnaire_datadock: {
        type: "string",
        default: "null",
        description: "Etablissement gestionnaire est connu de datadock",
      },
      etablissement_gestionnaire_published: {
        type: "boolean",
        default: false,
        description: "Etablissement gestionnaire est publié",
      },
      etablissement_gestionnaire_catalogue_published: {
        type: "boolean",
        default: false,
        description: "Etablissement gestionnaire entre dans le catalogue",
      },
      etablissement_gestionnaire_adresse: {
        type: "string",
        default: "null",
        description: "Numéro et rue établissement gestionnaire",
      },
      etablissement_gestionnaire_code_postal: {
        type: "string",
        default: "null",
        description: "Code postal établissement gestionnaire",
      },
      etablissement_gestionnaire_code_commune_insee: {
        type: "string",
        default: "null",
        description: "Code commune insee établissement gestionnaire",
      },
      etablissement_gestionnaire_localite: {
        type: "string",
        default: "null",
        description: "Localité établissement gestionnaire",
      },
      etablissement_gestionnaire_complement_adresse: {
        type: "string",
        default: "null",
        description: "Complément d'adresse de l'établissement gestionnaire",
      },
      etablissement_gestionnaire_cedex: {
        type: "string",
        default: "null",
        description: "Cedex",
      },
      etablissement_gestionnaire_entreprise_raison_sociale: {
        type: "string",
        default: "null",
        description: "Raison sociale établissement gestionnaire",
      },
      geo_coordonnees_etablissement_gestionnaire: {
        type: "string",
        description: "Latitude et longitude de l'établissement gestionnaire",
      },
      rncp_etablissement_gestionnaire_habilite: {
        type: "boolean",
        default: false,
        description: "Etablissement gestionnaire est habilité RNCP ou pas",
      },
      etablissement_gestionnaire_region: {
        type: "string",
        default: "null",
        description: "région gestionnaire",
      },
      etablissement_gestionnaire_num_departement: {
        type: "string",
        default: "null",
        description: "Numéro de departement gestionnaire",
      },
      etablissement_gestionnaire_nom_departement: {
        type: "string",
        default: "null",
        description: "Nom du departement gestionnaire",
      },
      etablissement_gestionnaire_nom_academie: {
        type: "string",
        default: "null",
        description: "Nom de l'académie gestionnaire",
      },
      etablissement_gestionnaire_num_academie: {
        type: "string",
        default: 0,
        description: "Numéro de l'académie gestionnaire",
      },
      etablissement_gestionnaire_siren: {
        type: "string",
        default: "null",
        description: "Numéro siren gestionnaire",
      },
      etablissement_gestionnaire_date_creation: {
        type: "string",
        default: "null",
        description: "Date de création de l'établissement",
        format: "date-time",
      },
      etablissement_formateur_id: {
        type: "string",
        default: "null",
        description: "Identifiant établissement formateur",
      },
      etablissement_formateur_siret: {
        type: "string",
        default: "null",
        description: "Numéro siret formateur",
      },
      etablissement_formateur_enseigne: {
        type: "string",
        default: "null",
        description: "Enseigne établissement formateur",
      },
      etablissement_formateur_uai: {
        type: "string",
        default: "null",
        description: "UAI de l'etablissement formateur",
      },
      etablissement_formateur_type: {
        type: "string",
        default: "null",
        description: "Etablissement formateur est un CFA ou un OF",
      },
      etablissement_formateur_conventionne: {
        type: "string",
        default: "null",
        description: "Etablissement formateur est conventionné ou pas",
      },
      etablissement_formateur_declare_prefecture: {
        type: "string",
        default: "null",
        description: "Etablissement formateur est déclaré en prefecture",
      },
      etablissement_formateur_datadock: {
        type: "string",
        default: "null",
        description: "Etablissement formateur est connu de datadock",
      },
      etablissement_formateur_published: {
        type: "boolean",
        default: false,
        description: "Etablissement formateur est publié",
      },
      etablissement_formateur_catalogue_published: {
        type: "boolean",
        default: false,
        description: "Etablissement formateur entre dans le catalogue",
      },
      etablissement_formateur_adresse: {
        type: "string",
        default: "null",
        description: "Numéro et rue établissement formateur",
      },
      etablissement_formateur_code_postal: {
        type: "string",
        default: "null",
        description: "Code postal établissement formateur",
      },
      etablissement_formateur_code_commune_insee: {
        type: "string",
        default: "null",
        description: "Code commune insee établissement formateur",
      },
      etablissement_formateur_localite: {
        type: "string",
        default: "null",
        description: "Localité établissement formateur",
      },
      etablissement_formateur_complement_adresse: {
        type: "string",
        default: "null",
        description: "Complément d'adresse de l'établissement",
      },
      etablissement_formateur_cedex: {
        type: "string",
        default: "null",
        description: "Cedex",
      },
      etablissement_formateur_entreprise_raison_sociale: {
        type: "string",
        default: "null",
        description: "Raison sociale établissement formateur",
      },
      geo_coordonnees_etablissement_formateur: {
        type: "string",
        description: "Latitude et longitude de l'établissement formateur",
      },
      rncp_etablissement_formateur_habilite: {
        type: "boolean",
        default: false,
        description: "Etablissement formateur est habilité RNCP ou pas",
      },
      etablissement_formateur_region: {
        type: "string",
        default: "null",
        description: "région formateur",
      },
      etablissement_formateur_num_departement: {
        type: "string",
        default: "null",
        description: "Numéro de departement formateur",
      },
      etablissement_formateur_nom_departement: {
        type: "string",
        default: "null",
        description: "Nom du departement formateur",
      },
      etablissement_formateur_nom_academie: {
        type: "string",
        default: "null",
        description: "Nom de l'académie formateur",
      },
      etablissement_formateur_num_academie: {
        type: "string",
        default: 0,
        description: "Numéro de l'académie formateur",
      },
      etablissement_formateur_siren: {
        type: "string",
        default: "null",
        description: "Numéro siren formateur",
      },
      etablissement_formateur_date_creation: {
        type: "string",
        default: "null",
        description: "Date de création de l'établissement",
        format: "date-time",
      },
      etablissement_reference: {
        type: "string",
        default: "null",
        description: "Etablissement reference  est soit formateur soit le gestionnaire",
      },
      etablissement_reference_type: {
        type: "string",
        default: "null",
        description: "Etablissement reference est un CFA ou un OF",
      },
      etablissement_reference_conventionne: {
        type: "string",
        default: "null",
        description: "Etablissement reference est conventionné ou pas",
      },
      etablissement_reference_declare_prefecture: {
        type: "string",
        default: "null",
        description: "Etablissement reference est déclaré en prefecture",
      },
      etablissement_reference_datadock: {
        type: "string",
        default: "null",
        description: "Etablissement reference est connu de datadock",
      },
      etablissement_reference_published: {
        type: "boolean",
        default: false,
        description: "Etablissement reference est publié",
      },
      etablissement_reference_catalogue_published: {
        type: "boolean",
        default: false,
        description: "Etablissement reference entre dans le catalogue",
      },
      rncp_etablissement_reference_habilite: {
        type: "boolean",
        default: false,
        description: "Etablissement reference est habilité RNCP ou pas",
      },
      etablissement_reference_date_creation: {
        type: "string",
        default: "null",
        description: "Date de création de l'établissement",
        format: "date-time",
      },
      cfd: {
        type: "string",
        default: "null",
        description: "Code formation diplome (education nationale)",
      },
      cfd_specialite: {
        type: "object",
        default: "null",
        description: "Lettre spécialité du code cfd",
      },
      cfd_outdated: {
        type: "boolean",
        default: false,
        description: "BCN : cfd périmé (fermeture avant le 31 aout de l'année courante)",
      },
      mef_10_code: {
        type: "string",
        default: "null",
        description: "Code MEF 10 caractères",
      },
      mefs_10: {
        type: "array",
        items: {},
        default: [],
        description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Affelnet si applicable)",
      },
      nom_academie: {
        type: "string",
        default: "null",
        description: "Nom de l'académie",
      },
      num_academie: {
        type: "string",
        default: 0,
        description: "Numéro de l'académie",
      },
      code_postal: {
        type: "string",
        default: "null",
        description: "Code postal",
      },
      code_commune_insee: {
        type: "string",
        default: "null",
        description: "Code commune INSEE",
      },
      num_departement: {
        type: "string",
        default: "null",
        description: "Numéro de departement",
      },
      nom_departement: {
        type: "string",
        default: "null",
        description: "Nom du departement",
      },
      region: {
        type: "string",
        default: "null",
        description: "Numéro de departement",
      },
      localite: {
        type: "string",
        default: "null",
        description: "Localité",
      },
      uai_formation: {
        type: "string",
        default: "null",
        description: "UAI de la formation",
      },
      nom: {
        type: "string",
        default: "null",
        description: "Nom de la formation déclaratif",
      },
      intitule_long: {
        type: "string",
        default: "null",
        description: "Intitulé long de la formation normalisé BCN",
      },
      intitule_court: {
        type: "string",
        default: "null",
        description: "Intitulé court de la formation normalisé BCN",
      },
      diplome: {
        type: "string",
        default: "null",
        description: "Diplôme ou titre visé",
      },
      niveau: {
        type: "string",
        default: "null",
        description: "Niveau de la formation",
      },
      onisep_url: {
        type: "string",
        default: "null",
        description: "Url de redirection vers le site de l'ONISEP",
      },
      rncp_code: {
        type: "string",
        default: "null",
        description: "Code RNCP",
      },
      rncp_intitule: {
        type: "string",
        default: "null",
        description: "Intitulé du code RNCP",
      },
      rncp_eligible_apprentissage: {
        type: "boolean",
        default: false,
        description: "Le titre RNCP est éligible en apprentissage",
      },
      rncp_details: {
        type: "object",
        default: "null",
        description: "Détails RNCP (bloc de compétences etc..)",
      },
      rome_codes: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
        description: "Codes ROME",
      },
      periode: {
        type: "string",
        default: "null",
        description: "Période d'inscription à la formation",
      },
      capacite: {
        type: "string",
        default: "null",
        description: "Capacité d'accueil",
      },
      duree: {
        type: "string",
        default: "null",
        description: "Durée de la formation en années",
      },
      annee: {
        type: "string",
        default: "null",
        description: "Année de la formation (cursus)",
      },
      email: {
        type: "string",
        default: "null",
        description: "Email du contact pour cette formation",
      },
      parcoursup_reference: {
        type: "boolean",
        default: false,
        description: "La formation est présent sur parcourSup",
      },
      parcoursup_a_charger: {
        type: "boolean",
        default: false,
        description: "La formation doit être ajouter à ParcourSup",
      },
      parcoursup_statut: {
        type: "string",
        enum: [
          "hors périmètre",
          "publié",
          "non publié",
          "à publier (vérifier accès direct postbac)",
          "à publier (soumis à validation Recteur)",
          "à publier",
          "en attente de publication",
        ],
        default: "hors périmètre",
        description: "Statut parcoursup",
      },
      parcoursup_error: {
        type: "string",
        default: "null",
        description: "Erreur lors du contrôle de référencement sur ParcourSup de la formation",
      },
      affelnet_reference: {
        type: "boolean",
        default: false,
        description: "La formation est présent sur affelnet",
      },
      affelnet_a_charger: {
        type: "boolean",
        default: false,
        description: "**[DEPRECATED]** La formation doit être ajouter à affelnet",
      },
      affelnet_statut: {
        type: "string",
        enum: [
          "hors périmètre",
          "publié",
          "non publié",
          "à publier (soumis à validation)",
          "à publier",
          "en attente de publication",
        ],
        default: "hors périmètre",
        description: "Statut affelnet",
      },
      affelnet_error: {
        type: "string",
        default: "null",
        description: "Erreur lors du contrôle de référencement sur affelnet de la formation",
      },
      source: {
        type: "string",
        default: "null",
        description: "Origine de la formation",
      },
      commentaires: {
        type: "string",
        default: "null",
        description: "Commentaires",
      },
      opcos: {
        type: "array",
        items: {
          type: "string",
        },
        default: "null",
        description: "Liste des opcos de la formation",
      },
      info_opcos: {
        type: "number",
        default: 0,
        description: "Code du statut de liaison avec un/des opcos",
      },
      info_opcos_intitule: {
        type: "string",
        default: "null",
        description: "Intitule du statut de liaison avec un/des opcos",
      },
      published: {
        type: "boolean",
        default: false,
        description: "Est publiée, la formation est éligible pour le catalogue",
      },
      draft: {
        type: "boolean",
        default: false,
        description: "En cours de creation",
      },
      created_at: {
        type: "string",
        description: "Date d'ajout en base de données",
        format: "date-time",
      },
      updates_history: {
        type: "array",
        items: {},
        default: [],
        description: "Historique des mises à jours",
      },
      last_update_at: {
        type: "string",
        description: "Date de dernières mise à jour",
        format: "date-time",
      },
      last_update_who: {
        type: "string",
        default: "null",
        description: "Qui a réalisé la derniere modification",
      },
      to_verified: {
        type: "boolean",
        default: false,
        description: "Formation à vérifier manuellement",
      },
      idea_geo_coordonnees_etablissement: {
        type: "string",
        description: "Latitude et longitude de l'établissement recherchable dans Idea",
      },
      update_error: {
        type: "string",
        default: "null",
        description: "Erreur lors de la mise à jour de la formation",
      },
      lieu_formation_geo_coordonnees: {
        type: "string",
        description: "Latitude et longitude du lieu de formation",
      },
      lieu_formation_adresse: {
        type: "string",
        default: "null",
        description: "Adresse du lieu de formation",
      },
      lieu_formation_siret: {
        type: "string",
        default: "null",
        description: "Siret du lieu de formation",
      },
      id_rco_formation: {
        type: "string",
        default: "null",
        description: "Id de formation RCO (id_formation + id_action + id_certifinfo)",
      },
      tags: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
        description: "Tableau de tags (2020, 2021, etc.)",
      },
      libelle_court: {
        type: "string",
        default: "null",
        description: "BCN : libelle court fusion table n_formation_diplome ou v_formation_diplome",
      },
      niveau_formation_diplome: {
        type: "string",
        default: "null",
        description: "BCN : niveau formation diplome",
      },
      affelnet_infos_offre: {
        type: "string",
        default: "null",
        description: "Affelnet : Informations offre de formation",
      },
      affelnet_code_nature: {
        type: "string",
        default: "null",
        description: "Affelnet : code nature de l'établissement de formation",
      },
      affelnet_secteur: {
        type: "string",
        enum: ["PR", "PU", null],
        default: "null",
        description: "Affelnet : type d'établissement (PR: Privé / PU: Public)",
      },
      bcn_mefs_10: {
        type: "array",
        items: {},
        default: "null",
        description: "BCN : Codes MEF 10 caractères",
      },
      _id: {
        type: "string",
        pattern: "^[0-9a-fA-F]{24}$",
      },
    },
  },
};
