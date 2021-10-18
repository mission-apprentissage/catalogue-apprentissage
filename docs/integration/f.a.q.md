# F.A.Q

## Peut-on récupérer l’historique de mise à jour d'une Formation ?

Oui, il possible d'obtenir les informations de mise à jour d'une Formation.   
L'ancienne valeur et la nouvelle sont stockées dans le champ _`updates_history`_   
Sous la forme :

```text
updates_history: [
    {
        from: { 
            // Liste des champs et leurs anciennes valeurs
        },
        to: { 
            // Liste des champs et leurs nouvelles valeurs
        },
        updated_at: Date à laquelle cette mise à jour a été réalisée 
    },
    // ... Toutes les mises à jour
]
```

Les critères de recherche sont très libre, avec l'aide d'un développeur vous pouvez rechercher via une requête sous forme MongoDB.   
  
Tester: 

[https://catalogue.apprentissage.beta.gouv.fr/api/v1/docs/\#/Formations/get\_entity\_formations2021](https://catalogue.apprentissage.beta.gouv.fr/api/v1/docs/#/Formations/get_entity_formations2021)

![](../.gitbook/assets/image%20%288%29.png)

Exemple de retour \(toutes les mises à jour des informations\): 

```javascript
 {
  "formations": [
    {
      "_id": "5fc616d4712d48a988134150",
      "updates_history": [
        {
          "from": {
            "onisep_intitule": null,
            "onisep_libelle_poursuite": null,
            "onisep_lien_site_onisepfr": null,
            "onisep_discipline": null,
            "onisep_domaine_sousdomaine": null
          },
          "to": {
            "onisep_intitule": "bac pro Cuisine",
            "onisep_libelle_poursuite": "BTS Management en hôtellerie restauration option A management d'unité de restauration ; BTS Management en hôtellerie restauration option B management d'unité de production culinaire ; MC Accueil réception ; BP Arts de la cuisine ; MC Cuisinier en desserts de restaurant ; MC Organisateur de réceptions",
            "onisep_lien_site_onisepfr": "http://www.onisep.fr/http/redirection/formation/slug/FOR.423",
            "onisep_discipline": "cuisine",
            "onisep_domaine_sousdomaine": "hôtellerie - restauration - tourisme/restauration"
          },
          "updated_at": 1618356243681
        },
        {
          "from": {
            "niveau": "4 (Bac...)",
            "idea_geo_coordonnees_etablissement": null
          },
          "to": {
            "niveau": "4 (BAC...)",
            "idea_geo_coordonnees_etablissement": "48.525558,7.731116"
          },
          "updated_at": 1620124029367
        },
        {
          "from": {
            "rncp_details": {
              "date_fin_validite_enregistrement": "1/1/24",
              "active_inactive": "ACTIVE",
              "etat_fiche_rncp": "Publiée",
              "niveau_europe": "niveau4",
              "code_type_certif": "BAC PRO",
              "type_certif": "Baccalauréat professionnel",
              "ancienne_fiche": [
                "RNCP794"
              ],
              "nouvelle_fiche": [],
              "demande": 0,
              "certificateurs": [
                {
                  "certificateur": "Ministère de l'Education nationale et de la jeunesse",
                  "siret_certificateur": "11004301500012"
                },
                {
                  "certificateur": "MINISTERE DE L'EDUCATION NATIONALE",
                  "siret_certificateur": null
                }
              ],
              "nsf_code": "221",
              "nsf_libelle": "Agro-alimentaire, alimentation, cuisine",
              "partenaires": null,
              "romes": [
                {
                  "rome": "G1602",
                  "libelle": "Personnel de cuisine"
                }
              ],
              "blocs_competences": [
                {
                  "numero_bloc": "RNCP12508BC01",
                  "intitule": "Bloc de compétences N° 1 fiche RNCP N° 12508- technologie"
                },
                {
                  "numero_bloc": "RNCP12508BC02",
                  "intitule": "Bloc de compétences N° 2 fiche RNCP N° 12508- sciences appliquées"
                },
                {
                  "numero_bloc": "RNCP12508BC03",
                  "intitule": "Bloc de compétences N° 3 fiche RNCP N° 12508- mathématiques"
                },
                {
                  "numero_bloc": "RNCP12508BC04",
                  "intitule": "Bloc de compétences N° 4 fiche RNCP N° 12508 - gestion appliquée"
                },
                {
                  "numero_bloc": "RNCP12508BC05",
                  "intitule": "Bloc de compétences N° 5 fiche RNCP N° 12508 - présentation du dossier   professionnel"
                },
                {
                  "numero_bloc": "RNCP12508BC06",
                  "intitule": "Bloc de compétences N°6 fiche RNCP N° 12508 - Pratique professionnelle"
                },
                {
                  "numero_bloc": "RNCP12508BC07",
                  "intitule": "Bloc de compétences N° 7 fiche RNCP N° 12508 - PSE"
                },
                {
                  "numero_bloc": "RNCP12508BC08",
                  "intitule": "Bloc de compétences N° 8 fiche RNCP N° 12508- langue vivante"
                },
                {
                  "numero_bloc": "RNCP12508BC09",
                  "intitule": "Bloc de compétences N° 9 fiche RNCP N° 12508- Histoire géographie et éducation morale et civique"
                },
                {
                  "numero_bloc": "RNCP12508BC10",
                  "intitule": "Bloc de compétences N° 10 fiche RNCP N° 12508- français"
                },
                {
                  "numero_bloc": "RNCP12508BC11",
                  "intitule": "Bloc de compétences N° 11 fiche RNCP N° 12508-Arts appliqués et cultures artistiques"
                },
                {
                  "numero_bloc": "RNCP12508BC12",
                  "intitule": "Bloc de compétences N° 12 fiche RNCP N° 12508-Éducation physique et sportive"
                }
              ],
              "voix_acces": [
                {
                  "code_libelle": "CANDIDATURE",
                  "si_jury": "Par candidature individuelle"
                },
                {
                  "code_libelle": "CONTRATA",
                  "si_jury": "En contrat d’apprentissage"
                },
                {
                  "code_libelle": "CONTRATP",
                  "si_jury": "En contrat de professionnalisation"
                },
                {
                  "code_libelle": "ELEVE",
                  "si_jury": "Après un parcours de formation sous statut d’élève ou d’étudiant"
                },
                {
                  "code_libelle": "EXP",
                  "si_jury": "Par expérience"
                },
                {
                  "code_libelle": "PFC",
                  "si_jury": "Après un parcours de formation continue"
                }
              ]
            }
          },
          "to": {
            "rncp_details": {
              "date_fin_validite_enregistrement": "01/01/2024",
              "nouvelle_fiche": null,
              "blocs_competences": {
                "0": {
                  "numero_bloc": "RNCP12508BC07",
                  "intitule": "Bloc de compétences N° 7 fiche RNCP N° 12508 - PSE",
                  "liste_competences": "<p>Conduire une démarche d'analyse de situations en appliquant la démarche de résolution de problème .<br />Analyser une situation professionnelle en appliquant différentes démarches : <br />analyse par le risque, par le travail, par l'accident  <br />Mobiliser des connaissances scientifiques, juridiques et économiques  <br />Proposer et justifier les mesures de prévention adaptées </p>",
                  "modalites_evaluation": null
                },
                "1": {
                  "numero_bloc": "RNCP12508BC08",
                  "intitule": "Bloc de compétences N° 8 fiche RNCP N° 12508- langue vivante",
                  "liste_competences": "<p>Compétences de niveau B1+ du CECRL<br />- S’exprimer oralement en continu<br />- Interagir en langue étrangère<br />- Comprendre un document écrit rédigé en langue étrangère</p>",
                  "modalites_evaluation": null
                },
                "2": {
                  "numero_bloc": "RNCP12508BC09",
                  "intitule": "Bloc de compétences N° 9 fiche RNCP N° 12508- Histoire géographie et éducation morale et civique",
                  "liste_competences": "<p>- Appréhender la diversité des sociétés et la richesse des cultures<br />- Comprendre les enjeux liés au développement durable<br />- Identifier les enjeux et contraintes de la mondialisation<br />- Identifier les droits et devoirs civils, politiques, économiques et sociaux</p>",
                  "modalites_evaluation": null
                },
                "3": {
                  "numero_bloc": "RNCP12508BC10",
                  "intitule": "Bloc de compétences N° 10 fiche RNCP N° 12508- français",
                  "liste_competences": "<p>- Entrer dans l’échange oral : écouter, réagir, s’exprimer<br />- Entrer dans l’échange écrit : lire, analyser, écrire<br />- Devenir un lecteur compétent et critique<br />- Confronter des savoirs et des valeurs pour construire son identité culturelle</p>",
                  "modalites_evaluation": null
                },
                "4": {
                  "numero_bloc": "RNCP12508BC11",
                  "intitule": "Bloc de compétences N° 11 fiche RNCP N° 12508-Arts appliqués et cultures artistiques",
                  "liste_competences": "<p>- Identifier les caractéristiques essentielles d’œuvres, de produits, d’espaces urbains ou de messages visuels<br />- Situer une œuvre ou une production dans son contexte de création<br />- Maîtriser les bases de la pratique des outils graphiques, traditionnels et informatiques</p>",
                  "modalites_evaluation": null
                },
                "5": {
                  "numero_bloc": "RNCP12508BC12",
                  "intitule": "Bloc de compétences N° 12 fiche RNCP N° 12508-Éducation physique et sportive",
                  "liste_competences": "<p>Compétences de niveau 4 du référentiel de compétences attendues<br />- Réaliser une performance motrice maximale<br />- Se déplacer en s’adaptant à des environnements variés et incertains<br />- Réaliser une prestation corporelle à visée artistique ou acrobatique<br />- Conduire et maîtriser un affrontement individuel ou collectif<br />- Respecter les règles de vie collective et assumer les différents rôles liés à l’activité   </p>",
                  "modalites_evaluation": null
                },
                "6": {
                  "numero_bloc": "RNCP12508BC01",
                  "intitule": "Bloc de compétences N° 1 fiche RNCP N° 12508- technologie",
                  "liste_competences": "<p>Mobiliser dans un contexte professionnel les connaissances relevant du domaine de la technologique</p>",
                  "modalites_evaluation": null
                },
                "7": {
                  "numero_bloc": "RNCP12508BC02",
                  "intitule": "Bloc de compétences N° 2 fiche RNCP N° 12508- sciences appliquées",
                  "liste_competences": "<p>Mobiliser dans un contexte professionnel les connaissances relevant du domaine des sciences appliquées</p>",
                  "modalites_evaluation": null
                },
                "8": {
                  "numero_bloc": "RNCP12508BC03",
                  "intitule": "Bloc de compétences N° 3 fiche RNCP N° 12508- mathématiques",
                  "liste_competences": "<p>- Rechercher, extraire et organiser l’information. <br />- Proposer, choisir, exécuter une méthode de résolution.<br />- Expérimenter, simuler.<br />- Critiquer un résultat, argumenter.<br />- Rendre compte d’une démarche, d’un résultat, à l’oral ou à l’écrit.</p>",
                  "modalites_evaluation": null
                },
                "9": {
                  "numero_bloc": "RNCP12508BC04",
                  "intitule": "Bloc de compétences N° 4 fiche RNCP N° 12508 - gestion appliquée",
                  "liste_competences": "<p>Mobiliser les savoirs du domaine de la gestion associés aux pôles de compétences professionnelles constitutifs du référentiel de certification.</p>",
                  "modalites_evaluation": null
                },
                "10": {
                  "numero_bloc": "RNCP12508BC05",
                  "intitule": "Bloc de compétences N° 5 fiche RNCP N° 12508 - présentation du dossier   professionnel ",
                  "liste_competences": "<p>Élaborer un dossier mettant en avant les compétences du candidat à présenter et mettre en perspective les résultats de ses activités professionnelles et/ou de formation. <br /><br /><br /></p>",
                  "modalites_evaluation": null
                },
                "11": {
                  "numero_bloc": "RNCP12508BC06",
                  "intitule": "Bloc de compétences N°6 fiche RNCP N° 12508 - Pratique professionnelle",
                  "liste_competences": "<p>Organiser la production <br />Maîtriser les bases de la cuisine <br />Cuisiner<br />Dresser et distribuer les préparations <br />Entretenir des relations professionnelles <br />Communiquer à des fins commerciales <br />Animer et optimiser les performance de l'équipe<br />Recenser les besoine en approvisionnement<br />Appliquer la démarche qualité<br />Maintenir la qualité globale</p>",
                  "modalites_evaluation": null
                }
              },
              "voix_acces": null
            }
          },
          "updated_at": 1620170901399
        }
      ],
      "id": "5fc616d4712d48a988134150"
    },
  ],
  "pagination": {
    "page": 1,
    "resultats_par_page": 10,
    "nombre_de_page": 21,
    "total": 203
  }
}
```

Via appels directs dans votre navigateur : 

```text
https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/entity/etablissements?select={"updates_history":1}&query={MA_REQUETE_MONGO}
```

## Question ? 

Réponse

