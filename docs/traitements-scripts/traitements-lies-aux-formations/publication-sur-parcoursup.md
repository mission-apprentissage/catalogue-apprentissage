---
description: >-
  Traitements effectués sur les formations du catalogue pour intégration dans le
  SI Parcoursup
---

# Publication sur Parcoursup

Les règles d'intégration s'appliquent sur l'ensemble des formations du catalogue, afin de mettre un statut (et visuellement un badge) sur les formations qui sont dans le périmètre Parcoursup.

Le script d'intégration est exécuté chaque nuit, après l'import RCO qui peut ajouter, supprimer ou modifier des formations et donc modifier leur statut pour Parcoursup.

## Liste des statuts

La liste des statuts possibles est la suivante :

- **"non intégrable"** : la formation n'est pas éligible à Parcoursup
- **"publié"** : la formation est déjà publiée sur Parcoursup
- **"non publié"** : la formation a été manuellement sortie du périmètre Parcoursup, via une action instructeur dans le module de publication
- **"à publier (sous condition habilitation)":** la formation est éligible à Parcoursup mais un contrôle concernant l'habilitation de l'organisme formateur doit être effectué
- **"à publier (vérifier accès direct postbac)":** la formation est éligible à Parcoursup mais un contrôle concernant l'accès postbac doit être effectué
- **"à publier (soumis à validation Recteur)":** la formation est éligible à Parcoursup mais doit être validée en académie avant
- **"à publier"** : la formation est éligible à Parcoursup, un instructeur doit utiliser le module de publication pour la faire passer à "prêt pour intégration"
- **"prêt pour intégration"** : la formation est éligible et un instructeur l'a publiée depuis le module de publication

Après action utilisateur on ne change plus le statut de la formation, donc le statut **"non publié"** ne bouge pas, et le statut **"prêt pour intégration"** peut passer à "publié" uniquement.

En revanche pour les statuts "non publiable en l'état", "à publier (...)" et "à publier" on recalcule chaque soir. À noter que ces statuts on la priorité suivante : `"à publier" > "à publier (soumis à validation Recteur)" > "à publier (vérifier accès direct postbac)" > "à publier (sous condition habilitation)" > "non publiable en l'état"`

## Règles d'intégration

Les règles d'intégration pour Parcoursup sont paramétrées depuis le module de périmètre sur le catalogue. C'est une interface d'administration configurée par la MOSS.

## Import Automatique

{% hint style="warning" %}
L'import automatique n'est pas activé sur Parcoursup pour le moment
{% endhint %}

Les formations seront à terme créées automatiquement sur Parcoursup, via un Web Service. Les formations postées sur sur WS sont celles qui ont les statuts **"prêt pour intégration"**.

## Historique des statuts

Chaque soir après le calcul des statuts Parcoursup, on écrit dans l'historique de la formation le statut Parcoursup qui lui a été attribué (champ `parcoursup_statut_history`). Cela nous permet de suivre les variations de statuts au niveau des académies, de suivre l'avancement de la collecte RCO, etc.
