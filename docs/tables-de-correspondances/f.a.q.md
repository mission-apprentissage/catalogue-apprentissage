# F.A.Q

## Peut-on récupérer l’historique de mise à jour d'un Établissement ?

Oui, il possible d'obtenir les informations de mise à jour d'un établissement.   
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

Les critères de recherche sont très libres, avec l'aide d'un développeur vous pouvez rechercher via une requête sous forme MongoDB.   
  
Tester: 

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Etablissements/get\_entity\_etablissements](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Etablissements/get_entity_etablissements)

![](../.gitbook/assets/image%20%287%29.png)

Exemple de retour \(mise à jour des informations de localisation\): 

```text
      {
          "from": {
            "code_commune_insee": null,
            "commune": null,
            "region": null,
            "num_region": null
          },
          "to": {
            "code_commune_insee": "78551",
            "commune": "Saint-Germain-en-Laye",
            "region": "Île-de-France",
            "num_region": "11"
          },
          "updated_at": 1620174235488
        }
```

Via appels directs dans votre navigateur : 

```text
https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/entity/etablissements?select={"updates_history":1}&query={MA_REQUETE_MONGO}
```

## Comment récupérer les évolutions d'un code formation diplôme ? 

Le chemin API [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/cfd](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/cfd)   
vous retournera les mises à jour BCN du code formation diplôme que vous recherchez.  
Vous trouverez les détails sur cette page :  

{% page-ref page="documentation/cfd-code-formation-diplome.md" %}



## Recherche d'établissement collecté par RCO via Siret et UAI ? 

Vous pouvez retrouver les détails sur cette page :

{% page-ref page="documentation/swagger/api-etablissement.md" %}

