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
        description: "Code formation diplôme (education nationale)",
      },
      cfd_specialite: {
        type: "object",
        default: "null",
        description: "Lettre spécialité du code cfd",
      },
      cfd_outdated: {
        type: "boolean",
        default: false,
        description: "BCN : cfd périmé (fermeture avant le 31 août de l'année courante)",
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
        description: "Code formation diplôme d'entrée (année 1 de l'apprentissage)",
      },
      nom_academie: {
        type: "string",
        default: "null",
        description: "Nom de l'académie",
      },
      num_academie: {
        type: "string",
        default: "0",
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
        description: "Numéro de département",
      },
      nom_departement: {
        type: "string",
        default: "null",
        description: "Nom du département",
      },
      region: {
        type: "string",
        default: "null",
        description: "Numéro de département",
      },
      localite: {
        type: "string",
        default: "null",
        description: "Localité",
      },
      nom: {
        type: "string",
        default: "null",
        description: "Nom de la formation déclaratif",
      },
      intitule_rco: {
        type: "string",
        default: "null",
        description: "Intitulé comme transmis par RCO",
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
        title: "rncp_details",
        type: "object",
        properties: {
          date_fin_validite_enregistrement: {
            type: ["string", "null"],
            default: null,
            description: "Date de validité de la fiche",
            format: "date-time",
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
            description: "Niveau européen ex: niveauu5",
          },
          code_type_certif: {
            type: ["string", "null"],
            default: null,
            description: "Code type de certification (ex: DE)",
          },
          type_certif: {
            type: ["string", "null"],
            default: null,
            description: "Type de certification (ex: diplôme d'état)",
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
            description: "Demande en cours de d'habilitation",
          },
          certificateurs: {
            type: "array",
            items: {},
            default: [],
            description: "Certificateurs",
          },
          nsf_code: {
            type: ["string", "null"],
            default: null,
            description: "Code NSF",
          },
          nsf_libelle: {
            type: ["string", "null"],
            default: null,
            description: "Libellé NSF",
          },
          romes: {
            type: "array",
            items: {},
            default: [],
            description: "Romes",
          },
          blocs_competences: {
            type: "array",
            items: {},
            default: [],
            description: "Blocs de compétences",
          },
          voix_acces: {
            type: "array",
            items: {},
            default: [],
            description: "Voix d'accès",
          },
          partenaires: {
            type: "array",
            items: {},
            default: [],
            description: "Partenaires",
          },
          rncp_outdated: {
            type: "boolean",
            default: false,
            description: "Code rncp périmé (date fin enregistrement avant le 31 aout de l'année courante)",
          },
        },
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
        default: [],
        description: "Périodes de début de la formation",
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
      duree_incoherente: {
        type: "boolean",
        default: "null",
        description: "Durée incohérente avec les codes mefs",
      },
      annee: {
        type: "string",
        default: "null",
        description: "Année de la formation (cursus)",
      },
      annee_incoherente: {
        type: "boolean",
        default: "null",
        description: "Année incohérente avec les codes mefs",
      },
      published: {
        type: "boolean",
        default: false,
        description: "Est publiée, la formation est éligible pour le catalogue",
      },
      forced_published: {
        type: "boolean",
        default: false,
        description:
          "La publication vers les plateformes est forcée (contournement catalogue non-éligible dans certains cas)",
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
      idea_geo_coordonnees_etablissement: {
        type: "string",
        description: "Latitude et longitude de l'établissement recherchable dans Idea",
      },
      lieu_formation_geo_coordonnees: {
        type: "string",
        description: "Latitude et longitude du lieu de formation",
      },
      lieu_formation_geo_coordonnees_computed: {
        type: "string",
        description: "Latitude et longitude du lieu de formation déduit de l'adresse du flux RCO",
      },
      distance: {
        type: "number",
        default: "null",
        description: "Distance entre les coordonnées transmises et déduites à partir de l'adresse",
      },
      lieu_formation_adresse: {
        type: "string",
        default: "null",
        description: "Adresse du lieu de formation",
      },
      lieu_formation_adresse_computed: {
        type: "string",
        default: "null",
        description: "Adresse du lieu de formation déduit de la géolocalisation du flux RCO",
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
        description: "Identifiant des actions concaténés",
      },
      ids_action: {
        type: "array",
        items: {
          type: "string",
        },
        default: [],
        description: "Identifiant des actions concaténés",
      },
      id_certifinfo: {
        type: "string",
        default: "null",
        description: "Identifiant certifInfo (unicité de la certification)",
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
        description: "BCN : niveau formation diplôme",
      },
      bcn_mefs_10: {
        type: "array",
        items: {
          title: "itemOf_bcn_mefs_10",
          type: "object",
          properties: {
            mef10: {
              type: "string",
            },
            modalite: {
              title: "modalite",
              type: "object",
              properties: {
                duree: {
                  type: "string",
                },
                annee: {
                  type: "string",
                },
              },
            },
          },
        },
        default: [],
        description: "BCN : Codes MEF 10 caractères",
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
      france_competence_infos: {
        title: "france_competence_infos",
        type: "object",
        properties: {
          fc_is_catalog_general: {
            type: "boolean",
          },
          fc_is_habilite_rncp: {
            type: "boolean",
          },
          fc_is_certificateur: {
            type: "boolean",
          },
          fc_is_certificateur_siren: {
            type: "boolean",
          },
          fc_is_partenaire: {
            type: "boolean",
          },
          fc_has_partenaire: {
            type: "boolean",
          },
        },
        default: "null",
        description: "Données pour étude France Compétence",
      },
      catalogue_published: {
        type: "boolean",
        default: false,
        description: "Formation éligible au catalogue générale",
      },
      date_debut: {
        type: "array",
        items: {
          type: "string",
          format: "date-time",
        },
        default: [],
        description: "Dates de début de session",
      },
      date_fin: {
        type: "array",
        items: {
          type: "string",
          format: "date-time",
        },
        default: [],
        description: "Dates de fin de session",
      },
      modalites_entrees_sorties: {
        type: "array",
        items: {
          type: "boolean",
        },
        default: [],
        description: "Session en entrée / sortie permanente",
      },
      id_RCO: {
        type: "string",
        default: "null",
        description: "Identifiant RCO",
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
      etablissement_gestionnaire_habilite_rncp: {
        type: "boolean",
        default: false,
        description: "Etablissement gestionnaire est habilité RNCP ou pas",
      },
      etablissement_gestionnaire_certifie_qualite: {
        type: "boolean",
        default: false,
        description: "Etablissement gestionnaire est certifié Qualité",
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
        default: "0",
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
      etablissement_formateur_habilite_rncp: {
        type: "boolean",
        default: false,
        description: "Etablissement formateur est habilité RNCP ou pas",
      },
      etablissement_formateur_certifie_qualite: {
        type: "boolean",
        default: false,
        description: "Etablissement formateur est certifié Qualité",
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
        default: "0",
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
        description: "Etablissement reference est soit formateur soit le gestionnaire",
      },
      etablissement_reference_published: {
        type: "boolean",
        default: false,
        description: "Etablissement reference est publié",
      },
      etablissement_reference_habilite_rncp: {
        type: "boolean",
        default: false,
        description: "Etablissement reference est habilité RNCP ou pas",
      },
      etablissement_reference_certifie_qualite: {
        type: "boolean",
        default: false,
        description: "Etablissement reference est certifié Qualité",
      },
      etablissement_reference_date_creation: {
        type: "string",
        default: "null",
        description: "Date de création de l'établissement",
        format: "date-time",
      },
      objectif: {
        type: "string",
        default: "null",
        description: "Objectif de la formation",
      },
      contenu: {
        type: "string",
        default: "null",
        description: "Contenu de la formation",
      },
      _id: {
        type: "string",
        pattern: "^[0-9a-fA-F]{24}$",
      },
    },
  },
};
