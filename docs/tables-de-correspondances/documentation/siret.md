# SIRET

## En entrée ?

Un siret 14 caractères dont je recherche les informations détaillées. Défini comme ci-dessous 

// TODO

## En sortie ?

Ce que je peux récupérer à partir d'un SIRET. 

| Nom du champ | Description | Type |
| :--- | :--- | :--- |
|  |  |  |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_siret](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_siret)

{% api-method method="post" host="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/siret" %}
{% api-method-summary %}
Récupérer les informations liées à un SIRET 
{% endapi-method-summary %}

{% api-method-description %}
Cette api vous permet de récupérer les informations relatives à un code siret.   
Appels sous-jacents API entreprise et API Sirene 
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="siret" type="string" required=true %}

{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
SIRET successfully retrieved.
{% endapi-method-response-example-description %}

```javascript

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_siret](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_siret)

![](../../.gitbook/assets/image%20%283%29.png)

### SDK

```javascript
// TODO
```

## Annexes

