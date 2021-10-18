# Coordonnées GPS

## En entrée ?

Une adresse dont je recherche les coordonnées  GPS. Définie comme ci-dessous 

// TODO

## En sortie ?

Ce que je peux récupérer à partir d'une adresse. 

| Nom du champ | Description | Type |
| :--- | :--- | :--- |
|  |  |  |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_coordinate](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_coordinate)

{% api-method method="post" host="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/coordinate" %}
{% api-method-summary %}
Récupérer les coordonnées GPS  liées à une adresse
{% endapi-method-summary %}

{% api-method-description %}
Cette api vous permet de récupérer les informations relatives à une adresse.  
Si **malencontreusement** vous appelez cette route avec un code commune Insee, l'api corrigera l'information.
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="numero\_voie" type="string" required=true %}

{% endapi-method-parameter %}

{% api-method-parameter name="type\_voie" type="string" required=true %}

{% endapi-method-parameter %}

{% api-method-parameter name="nom\_voie" type="string" required=true %}

{% endapi-method-parameter %}

{% api-method-parameter name="code\_postal" type="string" required=true %}

{% endapi-method-parameter %}

{% api-method-parameter name="localite" type="string" required=true %}

{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
COODINATE successfully retrieved.
{% endapi-method-response-example-description %}

```javascript

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_coordinate](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_coordinate)

![](../../.gitbook/assets/image%20%285%29.png)

### SDK

```javascript
// TODO
```

## Annexes

