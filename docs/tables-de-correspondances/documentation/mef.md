# MEF

## En entrée ?

Un code MEF 10 ou 11 caractères dont je recherche les informations détaillées. Défini comme ci-dessous 

* liste les formations qui existent de droit et reconnue par l'état
* dépend du ministère de l'Education Nationale
* utilisé par Parcoursup et Affelnet car plus précis que le code formation diplôme, données supplémentaires : durée de formation et année sur laquelle on s'inscrit

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

| MEF  | 2402242711 ([table](http://infocentre.pleiade.education.fr/bcn/index.php/workspace/viewTable/n/N_MEF/nbElements/20))                            | 1CAP1 ARTS & TECH.VERRE: DECORATEUR      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 240  | Dispositif formation ([table](http://infocentre.pleiade.education.fr/bcn/index.php/workspace/viewTable/n/N_DISPOSITIF_FORMATION/nbElements/20)) | CAP EN 1 AN                              |
| 224  | Groupe spécialité ou NSF ([table](http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_GROUPE_SPECIALITE))                        | MATERIAUX DE CONSTRUCTION, VERRE, CERAM. |
| 27   | Numéro d’ordre                                                                                                                                  | ??                                       |
| 1    | Durée                                                                                                                                           | 1 an                                     |
| 1    | Année                                                                                                                                           | 1ère année                               |

## En sortie ?

Ce que je peux récupérer à partir d'un MEF. 

| Nom du champ | Description | Type |
| ------------ | ----------- | ---- |
|              |             |      |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_mef](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_mef)

{% swagger baseUrl="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/mef" method="post" summary="Récupérer les informations liées à un MEF " %}
{% swagger-description %}
Cette api vous permet de récupérer les informations relatives à un MEF 10 ou 11 caractères. 

\


Appels sous-jacents aux tables BCN V et N formations, MEF 
{% endswagger-description %}

{% swagger-parameter in="body" name="mef" type="string" %}

{% endswagger-parameter %}

{% swagger-response status="200" description="MEF successfully retrieved." %}
```javascript
```
{% endswagger-response %}
{% endswagger %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_mef](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_mef)

![](<../../../.gitbook/assets/image (2).png>)

### SDK

```javascript
// TODO
```

## Annexes
