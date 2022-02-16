module.exports = {
  formation: {
    type: "object",
    properties: {
      cle_ministere_educatif: {
        type: "string",
        default: "null",
        description: "Clé unique de la formation (pour envoi aux ministères éducatifs)",
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
      cfd_date_fermeture: {
        type: "string",
        default: "null",
        description: "Date de fermeture du cfd",
        format: "date-time",
      },
      cfd_entree: {
        type: "string",
        default: "null",
        description: "Code formation diplome d'entrée (année 1 de l'apprentissage)",
      },
      affelnet_mefs_10: {
        type: "array",
        items: {},
        default: [],
        description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Affelnet si applicable)",
      },
      parcoursup_mefs_10: {
        type: "array",
        items: {},
        default: [],
        description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Parcoursup si applicable)",
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
        description: "UAI du lieu de la formation",
      },
      uai_formation_valide: {
        type: "boolean",
        default: "null",
        description: "L'UAI du lieu de formation est il valide ?",
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
      onisep_intitule: {
        type: "string",
        default: "null",
        description: "Intitulé éditorial l'ONISEP",
      },
      onisep_libelle_poursuite: {
        type: "string",
        default: "null",
        description: "Libellé poursuite étude l'ONISEP (séparateur ;)",
      },
      onisep_lien_site_onisepfr: {
        type: "string",
        default: "null",
        description: "Lien vers site de l'ONISEP api",
      },
      onisep_discipline: {
        type: "string",
        default: "null",
        description: "Disciplines ONISEP (séparateur ;)",
      },
      onisep_domaine_sousdomaine: {
        type: "string",
        default: "null",
        description: "Domaine et sous domaine ONISEP (séparateur ;)",
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
        properties: {
          date_fin_validite_enregistrement: {
            type: ["string", "null"],
            default: null,
            description: "Date de validité de la fiche",
          },
          active_inactive: {
            type: ["string", "null"],
            default: null,
            description: "fiche active ou non",
          },
          etat_fiche_rncp: {
            type: ["string", "null"],
            default: null,
            description: "état fiche ex: Publiée",
          },
          niveau_europe: {
            type: ["string", "null"],
            default: null,
            description: "Niveau europeen ex: niveauu5",
          },
          code_type_certif: {
            type: ["string", "null"],
            default: null,
            description: "Code type de certification (ex: DE)",
          },
          type_certif: {
            type: ["string", "null"],
            default: null,
            description: "Type de certification (ex: diplome d'etat)",
          },
          ancienne_fiche: {
            type: ["array", "null"],
            items: {
              type: "string",
            },
            default: null,
            description: "Code rncp de l'ancienne fiche",
          },
          nouvelle_fiche: {
            type: ["array", "null"],
            items: {
              type: "string",
            },
            default: null,
            description: "Code rncp de la nouvelle fiche",
          },
          demande: {
            type: "number",
            default: 0,
            description: "demande en cours de d'habilitation",
          },
          certificateurs: {
            type: "array",
            items: {
              type: "object",
            },
            default: [],
            description: "Certificateurs",
          },
          nsf_code: {
            type: ["string", "null"],
            default: null,
            description: "code NSF",
          },
          nsf_libelle: {
            type: ["string", "null"],
            default: null,
            description: "libéllé NSF",
          },
          romes: {
            type: "array",
            items: {
              type: "object",
            },
            default: [],
            description: "Romes",
          },
          blocs_competences: {
            type: "array",
            items: {
              type: "object",
            },
            default: [],
            description: "Blocs de compétences",
          },
          voix_acces: {
            type: "array",
            items: {
              type: "object",
            },
            default: [],
            description: "voix d'accès",
          },
          partenaires: {
            type: "array",
            items: {
              type: "object",
            },
            default: [],
            description: "partenaires",
          },
        },
        title: "rncp_details",
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
        type: "array",
        items: {
          type: "string",
          format: "date-time",
        },
        default: "null",
        description: "Périodes d'inscription à la formation",
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
      parcoursup_statut: {
        type: "string",
        enum: [
          "hors périmètre",
          "publié",
          "non publié",
          "à publier (sous condition habilitation)",
          "à publier (vérifier accès direct postbac)",
          "à publier (soumis à validation Recteur)",
          "à publier",
          "en attente de publication",
        ],
        default: "hors périmètre",
        description: "Statut parcoursup",
      },
      parcoursup_statut_history: {
        type: "array",
        items: {},
        default: [],
        description: "Parcoursup : historique des statuts",
      },
      parcoursup_error: {
        type: "string",
        default: "null",
        description: "Erreur lors de la création de la formation sur ParcourSup (via le WS)",
      },
      parcoursup_id: {
        type: "string",
        default: "null",
        description: "ids ParcourSup",
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
      affelnet_statut_history: {
        type: "array",
        items: {},
        default: [],
        description: "Affelnet : historique des statuts",
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
      rco_published: {
        type: "boolean",
        default: false,
        description: "Est publiée dans le flux rco",
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
      to_update: {
        type: "boolean",
        default: false,
        description: "Formation à mette à jour lors du script d'enrichissement",
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
      lieu_formation_adresse_computed: {
        type: "string",
        default: "null",
        description: "Adresse du lieu de formation déduit de la géolocalisation le flux RCO",
      },
      lieu_formation_siret: {
        type: "string",
        default: "null",
        description: "Siret du lieu de formation",
      },
      id_rco_formation: {
        type: "string",
        default: "null",
        description: "**[DEPRECATED]** Id de formation RCO (id_formation + id_action + id_certifinfo)",
      },
      id_formation: {
        type: "string",
        default: "null",
        description: "Identifiant de la formation",
      },
      id_action: {
        type: "string",
        default: "null",
        description: "Identifant des actions concaténés",
      },
      ids_action: {
        type: "array",
        items: {
          type: "string",
        },
        default: "null",
        description: "Identifant des actions concaténés",
      },
      id_certifinfo: {
        type: "string",
        default: "null",
        description: "Identifant certifInfo (unicité de la certification)",
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
      affelnet_raison_depublication: {
        type: "string",
        default: "null",
        description: "Affelnet : raison de dépublication",
      },
      bcn_mefs_10: {
        type: "array",
        items: {},
        default: "null",
        description: "BCN : Codes MEF 10 caractères",
      },
      editedFields: {
        type: "object",
        default: "null",
        description: "Champs édités par un utilisateur",
      },
      parcoursup_raison_depublication: {
        type: "string",
        default: "null",
        description: "Parcoursup : raison de dépublication",
      },
      distance_lieu_formation_etablissement_formateur: {
        type: "number",
        default: "null",
        description: "distance entre le Lieu de formation et l'établissement formateur",
      },
      niveau_entree_obligatoire: {
        type: "number",
        default: "null",
        description: "Niveau d'entrée de l'apprenti minimum obligatoire pour cette formation",
      },
      entierement_a_distance: {
        type: "boolean",
        default: false,
        description: "Renseigné si la formation peut être suivie entièrement à distance",
      },
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
      etablissement_gestionnaire_nda: {
        type: "string",
        default: "null",
        description: "Numéro Déclaration gestionnaire",
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
      etablissement_formateur_nda: {
        type: "string",
        default: "null",
        description: "Numéro Déclaration formateur",
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
      _id: {
        type: "string",
        pattern: "^[0-9a-fA-F]{24}$",
      },
    },
  },
};
