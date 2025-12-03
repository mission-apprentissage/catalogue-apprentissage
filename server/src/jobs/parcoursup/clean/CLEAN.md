# Clean des informations Parcoursup

## Contexte

Puisque certaines formations ont été ajoutées à la main dans PSUP, que certaines informations peuvent avoir changées dans le catalogue ou dans PSUP (ex: UAI lieu édité), nous pouvons nous retrouver avec un ensemble de formation qui de notre côté possède un parcoursup_id erroné.

## Processus

- `importListeFormation.js` : Import du fichier fournit par Parcoursup (transformer le xlsx en csv au préalable)
- `clean.js` : Applique un clean des parcoursup_ids du catalogue à partir d'un fichier de l'offre de formation Parcoursup,
