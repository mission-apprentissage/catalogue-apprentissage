# Clean des informations Parcoursup

## Contexte

Puisque certaines formations ont été ajoutées à la main dans PSUP, que certaines informations peuvent avoir changées dans le catalogue ou dans PSUP (ex: UAI lieu édité), nous pouvons nous retrouver avec un ensemble de formation qui de notre côté possède un parcoursup_id erroné.

Afin de cleaner les bases (PSUP et catalogue), un WS a été mis en place côté PSUP.

Après analyse des bases catalogue et PSUP, un fichier csv contenant des couples uniques cle_ministere_educatif / parcoursup_id a pu être établi.

## Processus

- `erase.js` : Supprime tous les parcoursup_id du catalogue,
- `integrate.js` : Prend un fichier csv pour réintégration des parcoursup_id ok,
- `sendWS.js` : envoie toutes les formations possédant un parcoursup_id vers Parcoursup afin qu'eux mêmes puissent réinstaurer les couples cle_ministere_educatif / parcoursup_id. Génère un fichier contenant les retours (succès ou erreur) du WS,
- `updateUais.js` : Après première analyse des résultats, certains envois vers PSUP sont en échec à cause d'un UAI mis à jour côté PSUP, mais pas catalogue. Donc on met à jour côté catalogue sur la base de ces retours de WS.
- `sendWS.js --clean` : Une fois tous les problèmes gérables sont gérés, les erreurs restantes indiquent des formations dont les informations PSUP sont à réinitialiser. On décide donc de supprimer les parcoursup_id problématique.
