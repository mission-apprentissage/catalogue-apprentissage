---
description: 'https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs'
---

# API établissement

## Définition 

{% api-method method="get" host="https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/entity" path="/etablissements/siret-uai" %}
{% api-method-summary %}
Recherche d' établissement par UAI, Siret ou adresse.
{% endapi-method-summary %}

{% api-method-description %}
Ce chemin vous permet de récupérer les informations établissement à partir  d'un UAI et/ou d'un Siret et/ou d'une adresse. ****
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-query-parameters %}
{% api-method-parameter name="query" type="object" required=true %}
Ce paramètre vous permet d’effectuer   
votre recherche.   
Exemples:  
query={"siret":"19400750600018"}  
  
query={"uai":"0400898J"}  
  
query={"siret":"19400750600018",  "uai": "0400898J"}  
  
query={"adresse": "2915 RTE DES BARTHES 40180"}  
  
La recherche peut contenir tous les champs du modèle établissement.    
  
⚠️ URL Encoded param   
 
{% endapi-method-parameter %}
{% endapi-method-query-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Etablissements trouvés
{% endapi-method-response-example-description %}

```javascript
{
    "etablissements": [
        {
            "siege_social": true,
            "etablissement_siege_siret": "19400750600018",
            "siret": "19400750600018",
            "siren": "194007506",
            "naf_code": "8532Z",
            "naf_libelle": "Enseignement secondaire technique ou professionnel",
            "date_creation": "1970-01-05T19:22:01.200Z",
            "date_mise_a_jour": "1970-01-19T01:42:54.479Z",
            "diffusable_commercialement": true,
            "enseigne": "LEGTA HECTOR SERRES",
            "adresse": "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLES DES LANDES\r\nLEGTA HECTOR SERRES\r\n2915 RTE DES BARTHES\r\n40180 OEYRELUY\r\nFRANCE",
            "numero_voie": "2915",
            "type_voie": "RTE",
            "nom_voie": "DES BARTHES",
            "complement_adresse": null,
            "code_postal": "40180",
            "num_departement": "40",
            "localite": "OEYRELUY",
            "code_insee_localite": "40207",
            "cedex": null,
            "date_fermeture": null,
            "ferme": false,
            "region_implantation_code": "75",
            "region_implantation_nom": "Nouvelle-Aquitaine",
            "commune_implantation_code": "40207",
            "commune_implantation_nom": "Oeyreluy",
            "pays_implantation_code": "FR",
            "pays_implantation_nom": "FRANCE",
            "num_academie": 4,
            "nom_academie": "Bordeaux",
            "uai": "0400898J",
            "formations_uais": [
            "0400918F",
            "0400898J"
            ],
            "computed_type": "CFA",
            "computed_declare_prefecture": "OUI",
            "computed_conventionne": "OUI",
            "computed_info_datadock": "datadocké",
            "entreprise_siren": "194007506",
            "entreprise_procedure_collective": false,
            "entreprise_enseigne": null,
            "entreprise_numero_tva_intracommunautaire": "FR26194007506",
            "entreprise_code_effectif_entreprise": "22",
            "entreprise_forme_juridique_code": "7331",
            "entreprise_forme_juridique": "Établissement public local d'enseignement",
            "entreprise_raison_sociale": "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLES DES LANDES",
            "entreprise_nom_commercial": "",
            "entreprise_capital_social": null,
            "entreprise_date_creation": "1970-01-01T02:42:39.600Z",
            "entreprise_date_radiation": null,
            "entreprise_naf_code": "8532Z",
            "entreprise_naf_libelle": "Enseignement secondaire technique ou professionnel",
            "entreprise_date_fermeture": null,
            "entreprise_ferme": false,
            "entreprise_siret_siege_social": "19400750600018",
            "entreprise_nom": null,
            "entreprise_prenom": null,
            "entreprise_categorie": "PME",
            "entreprise_tranche_effectif_salarie": {
            "de": 100,
            "a": 199,
            "code": "22",
            "date_reference": "2017",
            "intitule": "100 à 199 salariés"
            },
            "tranche_effectif_salarie": {
            "de": 50,
            "a": 99,
            "code": "21",
            "date_reference": "2017",
            "intitule": "50 à 99 salariés"
            },
            "geo_coordonnees": "43.658811,-1.068559",
            "score": 4.083333333333333
        }
    ],
    "pagination": {
        "page": 1,
        "resultats_par_page": 10,
        "nombre_de_page": 1,
        "total": 1
    }
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=404 %}
{% api-method-response-example-description %}
Erreur.
{% endapi-method-response-example-description %}

```javascript
{    "error": "DETAILS de l'erreure"}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

⚠️ **Attention: les paramètres URL doivent être Encodés.   
                         Pensez à encoder vos paramètres**    
Exemple :

> https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/entity/etablissements/siret-uai?query={"siret":"19400750600018"}

Devient

> [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/entity/etablissements/siret-uai?query=%7B%22siret%22%3A%2219400750600018%22%7D](https://tables-correspondances.apprentissage.beta.gouv.fr/api/entity/etablissements/siret-uai?query=%7B%22siret%22%3A%2219400750600018%22%7D)

Vous pouvez utiliser : [https://www.urlencoder.org/](https://www.urlencoder.org/)

## Exemples d'usages: 

### Recherche par Adresse

Il est **impératif** que chaque mots du champ adresse soit séparé par un " "\(espace\).  
Le champ **ne doit pas contenir de caractères spéciaux** de saut de ligne "\n", "\n\t" et autres.  
Le champ **"query"** adresse est insensible à la case.  
  
Les résultats sont triés par poids \("score"\) de récurrences des mots présent dans le champs adresse.

> https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/entity/etablissements/siret-uai?query={"adresse":"2915 RtE DES BarTHES 40180"}

Tester -&gt;

**Réponse simplifié :**

```javascript
{
    "etablissements": [
        {
            "siret": "19400750600034",
            "adresse": "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLES DES LANDES\r\nCENTRE DE FORMATION D'APPRENTIS DES LANDES\r\nLEGTA HECTOR SERRES\r\n2915 RTE DES BARTHES\r\n40180 OEYRELUY\r\nFRANCE",
            "uai": "0400898J",
            "geo_coordonnees": "43.658811,-1.068559",
            "score": 4.083333333333333
            ...autres champs
        },
        {
            "siret": "19400750600018",
            "adresse": "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLES DES LANDES\r\nLEGTA HECTOR SERRES\r\n2915 RTE DES BARTHES\r\n40180 OEYRELUY\r\nFRANCE",
            "uai": "0400898J",
            "geo_coordonnees": "43.658811,-1.068559",
            "score": 3.9642857142857144
            ...autres champs
        },
        {
            "siret": "35353902600032",
            "adresse": "FEDERATION REGIONALE DES MAISONS FAMILIALES RURALES DE LA REGION CENTRE ET ILE DE FRANCE\r\nINST RURAUX CENT FORMATIO\r\n90 RTE D ORLEANS\r\n45130 MEUNG-SUR-LOIRE\r\nFRANCE",
            "uai": "0451715V",
            "geo_coordonnees": "47.832449,1.704018",
            "score": 1.8425925925925926
            ...autres champs
        }
    ],
    "pagination": {
        "page": 1,
        "resultats_par_page": 3,
        "nombre_de_page": 1,
        "total": 3
    }
}
```

### Recherche par Siret

> https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/entity/etablissements/siret-uai?query={"siret":"19400750600018"}

#### Réponse

```javascript
{
    "etablissements": [
        {
            "siege_social": true,
            "etablissement_siege_siret": "19400750600018",
            "siret": "19400750600018",
            "siren": "194007506",
            "naf_code": "8532Z",
            "naf_libelle": "Enseignement secondaire technique ou professionnel",
            "date_creation": "1970-01-05T19:22:01.200Z",
            "date_mise_a_jour": "1970-01-19T01:42:54.479Z",
            "diffusable_commercialement": true,
            "enseigne": "LEGTA HECTOR SERRES",
            "adresse": "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLES DES LANDES\r\nLEGTA HECTOR SERRES\r\n2915 RTE DES BARTHES\r\n40180 OEYRELUY\r\nFRANCE",
            "numero_voie": "2915",
            "type_voie": "RTE",
            "nom_voie": "DES BARTHES",
            "complement_adresse": null,
            "code_postal": "40180",
            "num_departement": "40",
            "localite": "OEYRELUY",
            "code_insee_localite": "40207",
            "cedex": null,
            "date_fermeture": null,
            "ferme": false,
            "region_implantation_code": "75",
            "region_implantation_nom": "Nouvelle-Aquitaine",
            "commune_implantation_code": "40207",
            "commune_implantation_nom": "Oeyreluy",
            "pays_implantation_code": "FR",
            "pays_implantation_nom": "FRANCE",
            "num_academie": 4,
            "nom_academie": "Bordeaux",
            "uai": "0400898J",
            "formations_uais": [
                "0400918F",
                "0400898J"
            ],
            "computed_type": "CFA",
            "computed_declare_prefecture": "OUI",
            "computed_conventionne": "OUI",
            "computed_info_datadock": "datadocké",
            "entreprise_siren": "194007506",
            "entreprise_procedure_collective": false,
            "entreprise_enseigne": null,
            "entreprise_numero_tva_intracommunautaire": "FR26194007506",
            "entreprise_code_effectif_entreprise": "22",
            "entreprise_forme_juridique_code": "7331",
            "entreprise_forme_juridique": "Établissement public local d'enseignement",
            "entreprise_raison_sociale": "ETABLISSEMENT PUBLIC LOCAL D'ENSEIGNEMENT ET DE FORMATION PROFESSIONNELLE AGRICOLES DES LANDES",
            "entreprise_nom_commercial": "",
            "entreprise_capital_social": null,
            "entreprise_date_creation": "1970-01-01T02:42:39.600Z",
            "entreprise_date_radiation": null,
            "entreprise_naf_code": "8532Z",
            "entreprise_naf_libelle": "Enseignement secondaire technique ou professionnel",
            "entreprise_date_fermeture": null,
            "entreprise_ferme": false,
            "entreprise_siret_siege_social": "19400750600018",
            "entreprise_nom": null,
            "entreprise_prenom": null,
            "entreprise_categorie": "PME",
            "entreprise_tranche_effectif_salarie": {
                "de": 100,
                "a": 199,
                "code": "22",
                "date_reference": "2017",
                "intitule": "100 à 199 salariés"
            },
            "tranche_effectif_salarie": {
                "de": 50,
                "a": 99,
                "code": "21",
                "date_reference": "2017",
                "intitule": "50 à 99 salariés"
            },
            "geo_coordonnees": "43.658811,-1.068559"
        }
    ],
    "pagination": {
        "page": 1,
        "resultats_par_page": 10,
        "nombre_de_page": 1,
        "total": 1
    }
}
```

