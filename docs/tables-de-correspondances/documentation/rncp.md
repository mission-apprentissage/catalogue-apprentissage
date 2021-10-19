---
description: RNCP - France Compétences
---

# RNCP - Code fiche Répertoire National des Certifications Professionnelles

## En entrée ?

Un code RNCP dont je recherche les informations détaillées. Défini comme ci-dessous 

* liste les formations professionnelles (adaptées au marché de l’emploi)
* dépend du Ministère du travail / France compétence
* utilisé par le Ministère du travail et le Ministère de l’enseignement supérieur, de la recherche et et de l’innovation (MESRI).

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

| RNCP521 | CAP - ARTS ET TECHNIQUES DU VERRE OPTION : DECORATEUR SUR VERRE |
| ------- | --------------------------------------------------------------- |
| 521     |                                                                 |

## En sortie ?

Ce que je peux récupérer à partir RNCP. 

| Nom du champ                     | Description                                                                                         | Type              |
| -------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------- |
| code_rncp                        | La valeur du code RNCP recherché                                                                    | string            |
| intitule_diplome                 | Intitulé fiche RNCP France Compétences                                                              | string            |
| cfds                             | Liste des codes formation diplôme associés                                                          | \[string]         |
| date_fin_validite_enregistrement | Date de fin de validité de la fiche                                                                 | string            |
| active_inactive                  | <p>La fiche est-elle toujours en vigueur </p><p>ACTIVE / INACTIVE</p>                               | string            |
| etat_fiche_rncp                  | <p>État de la fiche pour France compétences</p><p>Publiée ou pas </p>                               | string            |
| niveau_europe                    | Niveau européen, exemple: _`niveau6`_                                                               | string            |
| code_type_certif                 | Type de certification Abréviation  (valeurs en bas de cette page)                                   | string \| null    |
| type_certif                      | Type de certification long                                                                          | string \| null    |
| ancienne_fiche                   | Liste des anciennes fiches par codes                                                                | \[string] \| null |
| nouvelle_fiche                   | Liste des nouvelles fiches par codes                                                                | \[string] \| null |
| demande                          | <p>État de la demande auprès de France Compétences</p><p>0 ou 1 </p>                                | number            |
| certificateurs                   | Liste des certificateurs avec  leur Nom et Siret                                                    | \[object]         |
| nsf_code                         | Code NSF                                                                                            | string            |
| nsf_libelle                      | Libellé NSF                                                                                         | string            |
| romes                            | Liste des codes romes avec leurs libellés                                                           | \[object]         |
| blocs_competences                | Liste des blocs de compétences                                                                      | \[object]         |
| voix_acces                       | Liste des voix d'accès                                                                              | \[object]         |
| partenaires                      | Liste des partenaires avec leur Nom et Siret                                                        | \[object]         |
| type_enregistrement              | <p> // TODO</p><p><em><code>"Enregistrement de droit"</code></em></p>                               | string            |
| si_jury_ca                       | <p>Décision du jury apprentissage </p><p><em><code>Oui</code></em> ou <em><code>Non</code></em></p> | string            |
| eligible_apprentissage           | Vrai, Faux                                                                                          | boolean           |
| releated                         | Information CFD, MEFS                                                                               | \[Object]         |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_rncp](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_rncp)

{% swagger baseUrl="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/rncp" method="post" summary="Récupérer les informations liées à un RNCP " %}
{% swagger-description %}
Cette API vous permet de récupérer les informations relatives à un code RNCP. 

\


Appels sous-jacents aux données France Compétences, tables BCN V et N formations, MEF, référentiel RNCP
{% endswagger-description %}

{% swagger-parameter in="body" name="rncp" type="string" %}

{% endswagger-parameter %}

{% swagger-response status="200" description="RNCP successfully retrieved." %}
```javascript
```
{% endswagger-response %}
{% endswagger %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_rncp](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_rncp)

![](<../../../.gitbook/assets/image (1).png>)

### SDK

```javascript
// TODO
```

## Annexes



**code_certif : ** BUT, DUT, Formation professionnelle,Formations  des écoles d'ingénieurs, Certificat de Spécialisation Agricole, BPJEPS, Sous-officier,Titre professionnel, Autre, MASTER,BP,BTS, Licence Professionnelle,Titre ingénieur,null,BAC PRO, LICENCE,BEPA,CAP,TP,BT,MC4,MC5,BEES,DIPLOVIS,BMA,BEP,DipViGrM,BTSA,DGE_GM,BAPAAT,DEUST,BTSMarit,DE,CS,CAPA,BPA,BTA,DOCTORAT,BEATEP,Grade_Master,DEAVS,DMA,DEDPAD,CAPD,CEAV,BTn,DSTS,CP,DNMADE,DEA,Grade_Licence,DEEA 

Exemple de** bloc de compétences **

```javascript
{
  "numero_bloc": "RNCP34826BC04",
  "intitule": "Accompagnement éducatif budgétaire",
  "liste_competences": "<p>C2.B1 Analyser les besoins d’un public   </p><p>   <br>C2.4 Mettre en œuvre un accompagnement éducatif budgétaire      </p>",
  "modalites_evaluation": "<p>Evaluer la capacité du candidat à: </p><p>Mettre en œuvre un accompagnement éducatif   budgétaire <br>Analyser la mise en œuvre de l’accompagnement   <br><br><br>Etude d’une situation d’accompagnement éducatif budgétaire   <br></p><p>Coefficient: <br>Ecrit: 1     <br></p><p>Durée de l'épreuve : 3 heures   <br></p><p>Evaluateurs/examinateurs :<br>- un formateur ou un universitaire et un professionnel confirmé du secteur     </p><p>Evaluation organisée par l'établissement de formation</p>"
},
{
  "numero_bloc": "RNCP34826BC05",
  "intitule": "Expression et communication écrite et orale",
  "liste_competences": "<p>C3.1 Elaborer une stratégie de communication à destination de différents publics  </p>",
  "modalites_evaluation": "<p>bloc de compétences validé en brevet de technicien supérieur « économie sociale familiale »</p>"
},
```
