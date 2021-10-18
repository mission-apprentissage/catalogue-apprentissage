# Code Postal

## En entrée ?

Un code postal 5 caractères dont je recherche les informations détaillées. Défini comme ci-dessous 

// TODO

## En sortie ?

Ce que je peux récupérer à partir d'un Code postal. 

| Nom du champ | Description | Type |
| :--- | :--- | :--- |
|  |  |  |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_code\_postal](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_code_postal)

{% api-method method="post" host="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/code-postal" %}
{% api-method-summary %}
Récupérer les informations liées à un code postal 
{% endapi-method-summary %}

{% api-method-description %}
Cette api vous permet de récupérer les informations relatives à un code postal.  
Si **malencontreusement** vous appelez cette adresse avec un code commune Insee, l'api corrigera l'information 
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="codePostal" type="string" required=true %}

{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
CODE POSTAL successfully retrieved.
{% endapi-method-response-example-description %}

```javascript

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_code\_postal](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_code_postal)

![](../../.gitbook/assets/image%20%284%29.png)

### SDK

```javascript
// TODO
```

## Annexes

