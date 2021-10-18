# SIRET

## En entrée ?

Un siret 14 caractères dont je recherche les informations détaillées. Défini comme ci-dessous 

// TODO

## En sortie ?

Ce que je peux récupérer à partir d'un SIRET. 

| Nom du champ | Description | Type |
| ------------ | ----------- | ---- |
|              |             |      |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_siret](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_siret)

{% swagger baseUrl="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/siret" method="post" summary="Récupérer les informations liées à un SIRET " %}
{% swagger-description %}
Cette api vous permet de récupérer les informations relatives à un code siret. 

\


Appels sous-jacents API entreprise et API Sirene 
{% endswagger-description %}

{% swagger-parameter in="body" name="siret" type="string" %}

{% endswagger-parameter %}

{% swagger-response status="200" description="SIRET successfully retrieved." %}
```javascript
```
{% endswagger-response %}
{% endswagger %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_siret](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_siret)

![](<../../../.gitbook/assets/image (3).png>)

### SDK

```javascript
// TODO
```

## Annexes
