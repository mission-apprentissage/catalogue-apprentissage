# Code Postal

## En entrée ?

Un code postal 5 caractères dont je recherche les informations détaillées. Défini comme ci-dessous 

// TODO

## En sortie ?

Ce que je peux récupérer à partir d'un Code postal. 

| Nom du champ | Description | Type |
| ------------ | ----------- | ---- |
|              |             |      |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_code_postal](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_code_postal)

{% swagger baseUrl="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/code-postal" method="post" summary="Récupérer les informations liées à un code postal " %}
{% swagger-description %}
Cette api vous permet de récupérer les informations relatives à un code postal.

\


Si 

**malencontreusement**

 vous appelez cette adresse avec un code commune Insee, l'api corrigera l'information 
{% endswagger-description %}

{% swagger-parameter in="body" name="codePostal" type="string" %}

{% endswagger-parameter %}

{% swagger-response status="200" description="CODE POSTAL successfully retrieved." %}
```javascript
```
{% endswagger-response %}
{% endswagger %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_code_postal](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_code_postal)

![](<../../../.gitbook/assets/image (4).png>)

### SDK

```javascript
// TODO
```

## Annexes
