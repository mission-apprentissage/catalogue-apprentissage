# Coordonnées GPS

## En entrée ?

Une adresse dont je recherche les coordonnées  GPS. Définie comme ci-dessous 

// TODO

## En sortie ?

Ce que je peux récupérer à partir d'une adresse. 

| Nom du champ | Description | Type |
| ------------ | ----------- | ---- |
|              |             |      |

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_coordinate](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_coordinate)

{% swagger baseUrl="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/coordinate" method="post" summary="Récupérer les coordonnées GPS  liées à une adresse" %}
{% swagger-description %}
Cette api vous permet de récupérer les informations relatives à une adresse.

\


Si 

**malencontreusement**

 vous appelez cette route avec un code commune Insee, l'api corrigera l'information.
{% endswagger-description %}

{% swagger-parameter in="body" name="numero_voie" type="string" %}

{% endswagger-parameter %}

{% swagger-parameter in="body" name="type_voie" type="string" %}

{% endswagger-parameter %}

{% swagger-parameter in="body" name="nom_voie" type="string" %}

{% endswagger-parameter %}

{% swagger-parameter in="body" name="code_postal" type="string" %}

{% endswagger-parameter %}

{% swagger-parameter in="body" name="localite" type="string" %}

{% endswagger-parameter %}

{% swagger-response status="200" description="COODINATE successfully retrieved." %}
```javascript
```
{% endswagger-response %}
{% endswagger %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_coordinate](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_coordinate)

![](<../../.gitbook/assets/image (5).png>)

### SDK

```javascript
// TODO
```

## Annexes
