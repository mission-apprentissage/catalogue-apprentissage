module.exports = {
  formation: {
    title: "formation",
    properties: {
      cle_ministere_educatif: {
        type: "string",
        description: "Clé unique de la formation (pour envoi aux ministères éducatifs)",
      },
      cfd: {
        type: "string",
        description: "Code formation diplôme (education nationale)",
      },
      cfd_specialite: {
        type: "object",
        description: "Lettre spécialité du code cfd",
        properties: {},
      },
      cfd_outdated: {
        type: "boolean",
        description: "BCN : cfd périmé (fermeture avant le 31 août de l'année courante)",
      },
      cfd_date_fermeture: {
        type: "string",
        description: "Date de fermeture du cfd",
        format: "date-time",
      },
      cfd_entree: {
        type: "string",
        description: "Code formation diplôme d'entrée (année 1 de l'apprentissage)",
      },
      cfd_entree_date_fermeture: {
        type: "string",
        description: "Date de fermeture du cfd",
        format: "date-time",
      },
      nom_academie: {
        type: "string",
        description: "Nom de l'académie",
      },
      num_academie: {
        type: "string",
        description: "Numéro de l'académie",
      },
      code_postal: {
        type: "string",
        description: "Code postal",
      },
      code_commune_insee: {
        type: "string",
        description: "Code commune INSEE",
      },
      num_departement: {
        type: "string",
        description: "Numéro de département",
      },
      nom_departement: {
        type: "string",
        description: "Nom du département",
      },
      region: {
        type: "string",
        description: "Numéro de département",
      },
      localite: {
        type: "string",
        description: "Localité",
      },
      uai_formation: {
        type: "string",
        description: "UAI du lieu de la formation",
      },
      uai_formation_valide: {
        type: "boolean",
        description: "L'UAI du lieu de formation est il valide ?",
      },
      nom: {
        type: "string",
        description: "Nom de la formation déclaratif",
      },
      intitule_rco: {
        type: "string",
        description: "Intitulé comme transmis par RCO",
      },
      intitule_long: {
        type: "string",
        description: "Intitulé long de la formation normalisé BCN",
      },
      intitule_court: {
        type: "string",
        description: "Intitulé court de la formation normalisé BCN",
      },
      diplome: {
        type: "string",
        description: "Diplôme ou titre visé",
      },
      niveau: {
        type: "string",
        description: "Niveau de la formation",
      },
      onisep_url: {
        type: "string",
        description: "Url de redirection vers le site de l'ONISEP",
      },
      onisep_intitule: {
        type: "string",
        description: "Intitulé éditorial l'ONISEP",
      },
      onisep_libelle_poursuite: {
        type: "string",
        description: "Libellé poursuite étude l'ONISEP (séparateur ;)",
      },
      onisep_lien_site_onisepfr: {
        type: "string",
        description: "Lien vers site de l'ONISEP api",
      },
      onisep_discipline: {
        type: "string",
        description: "Disciplines ONISEP (séparateur ;)",
      },
      onisep_domaine_sousdomaine: {
        type: "string",
        description: "Domaine et sous domaine ONISEP (séparateur ;)",
      },
      rncp_code: {
        type: "string",
        description: "Code RNCP",
      },
      rncp_intitule: {
        type: "string",
        description: "Intitulé du code RNCP",
      },
      rncp_eligible_apprentissage: {
        type: "boolean",
        description: "Le titre RNCP est éligible en apprentissage",
      },
      rncp_details: {
        type: "object",
        description: "Détails RNCP (bloc de compétences etc..)",
        properties: {
          date_fin_validite_enregistrement: {
            type: "string",
            description: "Date de validité de la fiche",
            format: "date-time",
          },
          active_inactive: {
            type: "string",
            description: "fiche active ou non",
          },
          etat_fiche_rncp: {
            type: "string",
            description: "état fiche ex: Publiée",
          },
          niveau_europe: {
            type: "string",
            description: "Niveau européen ex: niveauu5",
          },
          code_type_certif: {
            type: "string",
            description: "Code type de certification (ex: DE)",
          },
          type_certif: {
            type: "string",
            description: "Type de certification (ex: diplôme d'état)",
          },
          ancienne_fiche: {
            type: "array",
            description: "Code rncp de l'ancienne fiche",
            items: {
              type: "string",
            },
          },
          nouvelle_fiche: {
            type: "array",
            description: "Code rncp de la nouvelle fiche",
            items: {
              type: "string",
            },
          },
          demande: {
            type: "number",
            description: "Demande en cours de d'habilitation",
          },
          certificateurs: {
            type: "array",
            description: "Certificateurs",
            items: {
              type: "object",
              properties: {
                certificateur: {
                  type: "string",
                },
                siret_certificateur: {
                  type: "string",
                },
              },
              required: [],
            },
          },
          nsf_code: {
            type: "string",
            description: "Code NSF",
          },
          nsf_libelle: {
            type: "string",
            description: "Libellé NSF",
          },
          romes: {
            type: "array",
            description: "Romes",
            items: {
              type: "object",
              properties: {
                rome: {
                  type: "string",
                },
                libelle: {
                  type: "string",
                },
              },
              required: [],
            },
          },
          blocs_competences: {
            type: "array",
            description: "Blocs de compétences",
            items: {
              type: "object",
              properties: {},
              required: [],
            },
          },
          voix_acces: {
            type: "array",
            description: "Voix d'accès",
            items: {
              type: "object",
              properties: {},
              required: [],
            },
          },
          partenaires: {
            type: "array",
            description: "Partenaires",
            items: {
              type: "object",
              properties: {
                Nom_Partenaire: {
                  type: "string",
                },
                Siret_Partenaire: {
                  type: "string",
                },
                Habilitation_Partenaire: {
                  type: "string",
                },
              },
              required: [],
            },
          },
          rncp_outdated: {
            type: "boolean",
            description: "Code rncp périmé (date fin enregistrement avant le 31 aout de l'année courante)",
          },
          type_enregistrement: {
            type: "string",
            description: "Type d'enregistrement (issue de FranceCompétences)",
          },
        },
      },
      rome_codes: {
        type: "array",
        description: "Codes ROME",
        items: {
          type: "string",
        },
      },
      periode: {
        type: "array",
        description: "Périodes de début de la formation",
        items: {
          type: "string",
          format: "date-time",
        },
      },
      capacite: {
        type: "string",
        description: "Capacité d'accueil",
      },
      duree: {
        type: "string",
        description: "Durée de la formation en années",
      },
      duree_incoherente: {
        type: "boolean",
        description: "Durée incohérente avec les codes mefs",
      },
      annee: {
        type: "string",
        description: "Année de la formation (cursus)",
      },
      annee_incoherente: {
        type: "boolean",
        description: "Année incohérente avec les codes mefs",
      },
      rejection: {
        type: "object",
        description: "Cause du rejet de publication",
        properties: {
          error: {
            type: "string",
            description: "L'erreur telle que retournée par la plateforme",
          },
          description: {
            type: "string",
            description: "La description textuelle de l'erreur retournée",
          },
          action: {
            type: "string",
            description: "L'action à mener pour résoudre le rejet.",
          },
          handled_by: {
            type: "string",
            description: "Adresse email de la personne ayant pris en charge le rejet de publication",
          },
          handled_date: {
            type: "string",
            description: "Date à laquelle le rejet de publication a été pris en charge",
            format: "date-time",
          },
        },
      },
      last_statut_update_date: {
        type: "string",
        description: "Date de dernière modification du statut Affelnet ou Parcoursup",
        format: "date-time",
      },
      published: {
        type: "boolean",
        description: "Est publiée, la formation est éligible pour le catalogue",
      },
      forced_published: {
        type: "boolean",
        description:
          "La publication vers les plateformes est forcée (contournement catalogue non-éligible dans certains cas)",
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
        description: "Distance entre les coordonnées transmises et déduites à partir de l'adresse",
      },
      lieu_formation_adresse: {
        type: "string",
        description: "Adresse du lieu de formation",
      },
      lieu_formation_adresse_computed: {
        type: "string",
        description: "Adresse du lieu de formation déduit de la géolocalisation du flux RCO",
      },
      lieu_formation_siret: {
        type: "string",
        description: "Siret du lieu de formation",
      },
      id_rco_formation: {
        type: "string",
        description: "**[DEPRECATED]** Id de formation RCO (id_formation + id_action + id_certifinfo)",
      },
      id_formation: {
        type: "string",
        description: "Identifiant de la formation",
      },
      id_action: {
        type: "string",
        description: "Identifiant des actions concaténés",
      },
      ids_action: {
        type: "array",
        description: "Identifiant des actions concaténés",
        items: {
          type: "string",
        },
      },
      id_certifinfo: {
        type: "string",
        description: "Identifiant certifInfo (unicité de la certification)",
      },
      tags: {
        type: "array",
        description: "Tableau de tags (2020, 2021, etc.)",
        items: {
          type: "string",
        },
      },
      libelle_court: {
        type: "string",
        description: "BCN : libelle court fusion table n_formation_diplome ou v_formation_diplome",
      },
      niveau_formation_diplome: {
        type: "string",
        description: "BCN : niveau formation diplôme",
      },
      bcn_mefs_10: {
        type: "array",
        description: "BCN : Codes MEF 10 caractères",
        items: {
          type: "object",
          properties: {
            mef10: {
              type: "string",
            },
            modalite: {
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
            date_fermeture: {
              type: "string",
              format: "date-time",
            },
          },
          required: [],
        },
      },
      editedFields: {
        type: "object",
        description: "Champs édités par un utilisateur",
        properties: {},
      },
      distance_lieu_formation_etablissement_formateur: {
        type: "number",
        description: "distance entre le Lieu de formation et l'établissement formateur",
      },
      niveau_entree_obligatoire: {
        type: "number",
        description: "Niveau d'entrée de l'apprenti minimum obligatoire pour cette formation",
      },
      entierement_a_distance: {
        type: "boolean",
        description: "Renseigné si la formation peut être suivie entièrement à distance",
      },
      france_competence_infos: {
        type: "object",
        description: "Données pour étude France Compétence",
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
      },
      catalogue_published: {
        type: "boolean",
        description: "Formation éligible au catalogue générale",
      },
      date_debut: {
        type: "array",
        description: "Dates de début de session",
        items: {
          type: "string",
          format: "date-time",
        },
      },
      date_fin: {
        type: "array",
        description: "Dates de fin de session",
        items: {
          type: "string",
          format: "date-time",
        },
      },
      modalites_entrees_sorties: {
        type: "array",
        description: "Session en entrée / sortie permanente",
        items: {
          type: "boolean",
        },
      },
      id_RCO: {
        type: "string",
        description: "Identifiant RCO",
      },
      partenaires: {
        type: "array",
        description: "Partenaires",
        items: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      objectif: {
        type: "string",
        description: "Objectif de la formation",
      },
      contenu: {
        type: "string",
        description: "Identifiant de la formation",
      },
      siret_actif: {
        type: "string",
        description: "Badge siret actif/inactif",
      },
      nouvelle_fiche: {
        type: "boolean",
        description: "Nouvelle fiche",
      },
      CI_inscrit_rncp: {
        type: "string",
        description: "Type d'enregistrement (issue de CertifInfo)",
      },
      cle_me_remplace_par: {
        type: "string",
        description: "Est remplacée par la clé ME",
      },
      cle_me_remplace: {
        type: "string",
        description: "Remplace la clé ME",
      },
      agriculture: {
        type: "boolean",
        description: "La formation relève du ministère de l'agriculture",
      },
      etablissement_gestionnaire_id: {
        type: "string",
        description: "Identifiant établissement gestionnaire",
      },
      etablissement_gestionnaire_siret: {
        type: "string",
        description: "Numéro siret gestionnaire",
      },
      etablissement_gestionnaire_enseigne: {
        type: "string",
        description: "Enseigne établissement gestionnaire",
      },
      etablissement_gestionnaire_uai: {
        type: "string",
        description: "UAI de l'etablissement gestionnaire",
      },
      etablissement_gestionnaire_published: {
        type: "boolean",
        description: "Etablissement gestionnaire est publié",
      },
      etablissement_gestionnaire_habilite_rncp: {
        type: "boolean",
        description: "Etablissement gestionnaire est habilité RNCP ou pas",
      },
      etablissement_gestionnaire_certifie_qualite: {
        type: "boolean",
        description: "Etablissement gestionnaire est certifié Qualité",
      },
      etablissement_gestionnaire_adresse: {
        type: "string",
        description: "Numéro et rue établissement gestionnaire",
      },
      etablissement_gestionnaire_code_postal: {
        type: "string",
        description: "Code postal établissement gestionnaire",
      },
      etablissement_gestionnaire_code_commune_insee: {
        type: "string",
        description: "Code commune insee établissement gestionnaire",
      },
      etablissement_gestionnaire_localite: {
        type: "string",
        description: "Localité établissement gestionnaire",
      },
      etablissement_gestionnaire_complement_adresse: {
        type: "string",
        description: "Complément d'adresse de l'établissement gestionnaire",
      },
      etablissement_gestionnaire_cedex: {
        type: "string",
        description: "Cedex",
      },
      etablissement_gestionnaire_entreprise_raison_sociale: {
        type: "string",
        description: "Raison sociale établissement gestionnaire",
      },
      geo_coordonnees_etablissement_gestionnaire: {
        type: "string",
        description: "Latitude et longitude de l'établissement gestionnaire",
      },
      etablissement_gestionnaire_region: {
        type: "string",
        description: "région gestionnaire",
      },
      etablissement_gestionnaire_num_departement: {
        type: "string",
        description: "Numéro de departement gestionnaire",
      },
      etablissement_gestionnaire_nom_departement: {
        type: "string",
        description: "Nom du departement gestionnaire",
      },
      etablissement_gestionnaire_nom_academie: {
        type: "string",
        description: "Nom de l'académie gestionnaire",
      },
      etablissement_gestionnaire_num_academie: {
        type: "string",
        description: "Numéro de l'académie gestionnaire",
      },
      etablissement_gestionnaire_siren: {
        type: "string",
        description: "Numéro siren gestionnaire",
      },
      etablissement_gestionnaire_nda: {
        type: "string",
        description: "Numéro Déclaration gestionnaire",
      },
      etablissement_gestionnaire_date_creation: {
        type: "string",
        description: "Date de création de l'établissement",
        format: "date-time",
      },
      etablissement_gestionnaire_courriel: {
        type: "string",
        description: "Adresse email de contact de l'établissement gestionnaire",
      },
      etablissement_gestionnaire_actif: {
        type: "string",
        description: "SIRET actif ou inactif pour l'établissement gestionnaire",
      },
      etablissement_formateur_id: {
        type: "string",
        description: "Identifiant établissement formateur",
      },
      etablissement_formateur_siret: {
        type: "string",
        description: "Numéro siret formateur",
      },
      etablissement_formateur_enseigne: {
        type: "string",
        description: "Enseigne établissement formateur",
      },
      etablissement_formateur_uai: {
        type: "string",
        description: "UAI de l'etablissement formateur",
      },
      etablissement_formateur_published: {
        type: "boolean",
        description: "Etablissement formateur est publié",
      },
      etablissement_formateur_habilite_rncp: {
        type: "boolean",
        description: "Etablissement formateur est habilité RNCP ou pas",
      },
      etablissement_formateur_certifie_qualite: {
        type: "boolean",
        description: "Etablissement formateur est certifié Qualité",
      },
      etablissement_formateur_adresse: {
        type: "string",
        description: "Numéro et rue établissement formateur",
      },
      etablissement_formateur_code_postal: {
        type: "string",
        description: "Code postal établissement formateur",
      },
      etablissement_formateur_code_commune_insee: {
        type: "string",
        description: "Code commune insee établissement formateur",
      },
      etablissement_formateur_localite: {
        type: "string",
        description: "Localité établissement formateur",
      },
      etablissement_formateur_complement_adresse: {
        type: "string",
        description: "Complément d'adresse de l'établissement",
      },
      etablissement_formateur_cedex: {
        type: "string",
        description: "Cedex",
      },
      etablissement_formateur_entreprise_raison_sociale: {
        type: "string",
        description: "Raison sociale établissement formateur",
      },
      geo_coordonnees_etablissement_formateur: {
        type: "string",
        description: "Latitude et longitude de l'établissement formateur",
      },
      etablissement_formateur_region: {
        type: "string",
        description: "région formateur",
      },
      etablissement_formateur_num_departement: {
        type: "string",
        description: "Numéro de departement formateur",
      },
      etablissement_formateur_nom_departement: {
        type: "string",
        description: "Nom du departement formateur",
      },
      etablissement_formateur_nom_academie: {
        type: "string",
        description: "Nom de l'académie formateur",
      },
      etablissement_formateur_num_academie: {
        type: "string",
        description: "Numéro de l'académie formateur",
      },
      etablissement_formateur_siren: {
        type: "string",
        description: "Numéro siren formateur",
      },
      etablissement_formateur_nda: {
        type: "string",
        description: "Numéro Déclaration formateur",
      },
      etablissement_formateur_date_creation: {
        type: "string",
        description: "Date de création de l'établissement",
        format: "date-time",
      },
      etablissement_formateur_courriel: {
        type: "string",
        description: "Adresse email de contact de l'établissement formateur",
      },
      etablissement_formateur_actif: {
        type: "string",
        description: "SIRET actif ou inactif pour l'établissement formateur",
      },
      etablissement_reference: {
        type: "string",
        description: "Etablissement reference est soit formateur soit le gestionnaire",
      },
      etablissement_reference_published: {
        type: "boolean",
        description: "Etablissement reference est publié",
      },
      etablissement_reference_habilite_rncp: {
        type: "boolean",
        description: "Etablissement reference est habilité RNCP ou pas",
      },
      etablissement_reference_certifie_qualite: {
        type: "boolean",
        description: "Etablissement reference est certifié Qualité",
      },
      etablissement_reference_date_creation: {
        type: "string",
        description: "Date de création de l'établissement",
        format: "date-time",
      },
      parcoursup_perimetre: {
        type: "boolean",
        description: "Dans le périmètre parcoursup",
      },
      parcoursup_session: {
        type: "boolean",
        description: "Possède une date de début durant la prochaine session Parcoursup",
      },
      parcoursup_previous_session: {
        type: "boolean",
        description: "Possède une date de début durant la précédente session Parcoursup",
      },
      parcoursup_statut: {
        type: "string",
        enum: [
          "non publiable en l'état",
          "publié",
          "non publié",
          "à publier",
          "en attente de publication",
          "à publier (vérifier accès direct postbac)",
          "à publier (soumis à validation Recteur)",
          "à publier (sous condition habilitation)",
          "rejet de publication",
          "fermé",
        ],
        description: "Statut parcoursup",
      },
      parcoursup_previous_statut: {
        type: "string",
        enum: [
          "non publiable en l'état",
          "publié",
          "non publié",
          "à publier",
          "en attente de publication",
          "à publier (vérifier accès direct postbac)",
          "à publier (soumis à validation Recteur)",
          "à publier (sous condition habilitation)",
          "rejet de publication",
          "fermé",
        ],
        description: "Statut parcoursup à la fin de la précédente campagne",
      },
      parcoursup_statut_history: {
        type: "array",
        description: "Parcoursup : historique des statuts",
        items: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      parcoursup_error: {
        type: "string",
        description: "Erreur lors de la création de la formation sur ParcourSup (via le WS)",
      },
      parcoursup_id: {
        type: "string",
        description: "identifiant Parcoursup de la formation (g_ta_cod)",
      },
      parcoursup_published_date: {
        type: "string",
        description: 'Date de publication (passage au statut "publié")',
        format: "date-time",
      },
      parcoursup_export_date: {
        type: "string",
        description: "Date de la dernière tentative d'export vers Parcoursup",
        format: "date-time",
      },
      parcoursup_raison_depublication: {
        type: "string",
        description: "Parcoursup : raison de dépublication",
      },
      parcoursup_mefs_10: {
        type: "array",
        description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Parcoursup si applicable)",
        items: {
          type: "object",
          properties: {
            mef10: {
              type: "string",
            },
            modalite: {
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
            date_fermeture: {
              type: "string",
              format: "date-time",
            },
          },
          required: [],
        },
      },
      parcoursup_statut_reinitialisation: {
        type: "object",
        description: "Statut parcoursup",
        properties: {
          user: {
            type: "string",
            description: "Utilisateur ayant effectué la réinitialisation",
          },
          date: {
            type: "string",
            description: "Date à laquelle la réinitialisation a été effectuée",
            format: "date-time",
          },
          comment: {
            type: "string",
            description: "Motif de la réinitialisation",
          },
        },
      },
      parcoursup_publication_auto: {
        type: "boolean",
        description: "Parcoursup : publication auto",
      },
      parcoursup_perimetre_prise_rdv: {
        type: "boolean",
        description: "Parcoursup : visible",
      },
      affelnet_perimetre: {
        type: "boolean",
        description: "Dans le périmètre Affelnet",
      },
      affelnet_session: {
        type: "boolean",
        description: "Possède une date de début durant la prochaine session Affelnet",
      },
      affelnet_previous_session: {
        type: "boolean",
        description: "Possède une date de début durant la précédente session Affelnet",
      },
      affelnet_statut: {
        type: "string",
        enum: [
          "non publiable en l'état",
          "publié",
          "non publié",
          "à publier",
          "en attente de publication",
          "à publier (soumis à validation)",
        ],
        description: "Statut affelnet",
      },
      affelnet_previous_statut: {
        type: "string",
        enum: [
          "non publiable en l'état",
          "publié",
          "non publié",
          "à publier",
          "en attente de publication",
          "à publier (soumis à validation)",
        ],
        description: "Statut affelnet à la fin de la précédente campagne",
      },
      affelnet_statut_history: {
        type: "array",
        description: "Affelnet : historique des statuts",
        items: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      affelnet_id: {
        type: "string",
        description: "identifiant Affelnet de la formation (code vœu)",
      },
      affelnet_published_date: {
        type: "string",
        description: 'Date de publication (passage au statut "publié")',
        format: "date-time",
      },
      affelnet_infos_offre: {
        type: "string",
        description: "Affelnet : Informations offre de formation",
      },
      affelnet_url_infos_offre: {
        type: "string",
        description: "Affelnet : Libellé ressource complémentaire",
      },
      affelnet_modalites_offre: {
        type: "string",
        description: "Affelnet : Modalités particulières",
      },
      affelnet_url_modalites_offre: {
        type: "string",
        description: "Affelnet : Lien vers la ressource",
      },
      affelnet_code_nature: {
        type: "string",
        description: "Affelnet : code nature de l'établissement de formation",
      },
      affelnet_secteur: {
        type: "string",
        enum: ["PR", "PU", null],
        description: "Affelnet : type d'établissement (PR: Privé / PU: Public)",
      },
      affelnet_raison_depublication: {
        type: "string",
        description: "Affelnet : raison de dépublication",
      },
      affelnet_mefs_10: {
        type: "array",
        description: "Tableau de Code MEF 10 caractères et modalités (filtrés pour Affelnet si applicable)",
        items: {
          type: "object",
          properties: {
            mef10: {
              type: "string",
            },
            modalite: {
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
            date_fermeture: {
              type: "string",
              format: "date-time",
            },
          },
          required: [],
        },
      },
      affelnet_publication_auto: {
        type: "boolean",
        description: "Affelnet : publication auto",
      },
      affelnet_perimetre_prise_rdv: {
        type: "boolean",
        description: "Affelnet : visible",
      },
      _id: {
        type: "string",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
    },
  },
};
