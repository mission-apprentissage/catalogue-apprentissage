# Script d'export des formations pour Parcoursup

Pour création des formations "prêt pour intégration"

## Vue d'ensemble

Un Web Service est développé côté Parcoursup.
Le catalogue appelle ce WS avec les formations `"prêt pour intégration"`.

La fréquence d'envoi est quotidienne, avec des appels 1 formation par 1 formation, avec un seuil de 50 formations par jour pour commencer (on adaptera si c'est insuffisant).

## Détails techniques

Le web service consiste en un endpoint REST à appeler en POST.
Les échanges sont sécurisés via un token JWT.

En cas de succès le WS répondra avec un identifiant (`gta_code` côté Parcoursup, `id_parcoursup` côté catalogue). La formation correspondante dans le catalogue passera alors au statut "publié".

En cas d'erreur, un message sera renvoyé, par exemple si l'établissement n'existe pas chez Parcoursup (on passera par une création manuelle dans ce cas par exemple).
En cas d'appel invalide (erreur de signature par exemple), une erreur 404 sera renvoyée.
