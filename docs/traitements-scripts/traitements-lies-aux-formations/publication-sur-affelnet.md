---
description: >-
  Traitements effectués sur les formations du catalogue pour intégration dans le
  SI Affelnet
---

# Publication sur Affelnet

Les règles de pertinence s'appliquent sur l'ensemble des formations du catalogue, afin de mettre un statut \(et visuellement un badge\) sur les formations qui sont dans le périmètre Affelnet.

Le script de pertinence est exécuté chaque nuit, après l'import RCO qui peut ajouter, supprimer ou modifier des formations et donc modifier leur statut pour Affelnet.

## Liste des statuts

La liste des statuts possibles est la suivante :

* **"hors périmètre"** : la formation n'est pas éligible à Affelnet
* **"publié"** : la formation est déjà publiée sur Affelnet
* **"non publié"** : la formation a été manuellement sortie du périmètre Affelnet, via une action instructeur dans le module de publication
* **"à publier \(soumis à validation\)"** : la formation est éligible à Affelnet mais doit être validée en académie avant
* **"à publier"** : la formation est éligible à Affelnet, un instructeur doit utiliser le module de publication pour la faire passer à "en attente de publication"
* **"en attente de publication"** : la formation est éligible et un instructeur l'a publiée depuis le module de publication

Après action utilisateur on ne change plus le statut de la formation, donc le statut **"non publié"** ne bouge pas, et le statut **"en attente de publication"** peut passer à "publié" uniquement.

En revanche pour les statuts "hors périmètre", "à publier \(soumis à validation\)" et "à publier" on recalcule chaque soir. À noter que ces statuts on la priorité suivante : `"à publier" > "à publier (soumis à validation)" > "hors périmètre"`.

## Règles de pertinence

Les règles de pertinence pour Affelnet sont sur les diplômes et les mefs. Exemple : les "BAC PROFESSIONNEL" dont le mef termine par "31" et commence par "247" auront le statut **"à publier"**.

Pour chaque règle on contrôle également la date de fermeture du cfd, on exclut les formations dont le cfd expire avant le 31/12 de l'année `N + durée -1`. Si l'année N = 2021, pour les formations en 1 an, on vérifie si le cfd expire avant le 31/12/2021, en 2 ans avant le 31/12/2022, en 3 ans avant le 31/12/2023.

## Import Automatique

Les formations sont ensuite importées automatiquement par Affelnet, via l'API du catalogue. Les formations importées automatiquement par Affelnet sont celles qui ont les statuts **"publié"** et **"en attente de publication"**.

Affelnet étant un logiciel installé séparément par académie, voici un exemple de requête pour l'académie de Toulouse :

```text
https://catalogue.apprentissage.beta.gouv.fr/api/entity/formations2021?query={"affelnet_statut":{"$in":["publié","en attente de publication"]},"num_academie" :16}
```

## Déduction du mef Affelnet & modalités

Les règles de pertinences ont également une autre utilité, celle de déterminer le mef de la formation et d'en extraire les modalités \(durée et année d'inscription\). En effet les formations ont un tableau de mefs \(correspondant à tous les mefs existants pour le cfd de la formation\), on applique alors les règles de pertinence sur chaque formation, et si la formation est eligible via une des règles, on lui donne le mef correspondant et on en déduit les modalités.

{% hint style="info" %}
Ce mef est indispensable pour l'import automatique par Affelnet
{% endhint %}

## Historique des statuts

Chaque soir après le calcul des statuts affelnet, on écrit dans l'historique de la formation le statut Affelnet qui lui a été attribué \(champ `affelnet_statut_history`\). Cela nous permet de suivre les variations de statuts au niveau des académies, de suivre l'avancement de la collecte RCO, etc.

