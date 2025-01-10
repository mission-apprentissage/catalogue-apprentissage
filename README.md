<!-- [![Uptime](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fmission-apprentissage%2Fupptime%2Fmaster%2Fapi%2Fcatalogue%2Fuptime.json)](https://mission-apprentissage.github.io/upptime/history/catalogue) -->
<!-- [![codecov](https://codecov.io/gh/mission-apprentissage/catalogue-apprentissage/branch/master/graph/badge.svg?token=PNKREEQN2Z)](https://codecov.io/gh/mission-apprentissage/catalogue-apprentissage) -->

![](https://avatars1.githubusercontent.com/u/63645182?s=200&v=4)

# Catalogue des offres de formations en apprentissage

## Pré-requis

Ce Projet est basé sur le template de la mission apprentissage: https://github.com/mission-apprentissage/template-apprentissage

Les pré-requis sont les mêmes :

- NodeJs 18
- Yarn 3+
- Docker & Docker-compose

## Présentation

### Généralités

Le Catalogue des offres de formations en apprentissage permet de rendre accessible l'information sur les formations en apprentissage.

Les offres de formations sont récupérées quotidiennement depuis un Web Service mis à disposition par le réseau des Carif-Oref.
Les données sont ensuite **vérifiées** (Siret valides, Codes diplôme non expirés...), et **enrichies** (ajout des données Datadock, Qualiopi, informations RNCP...).

### Ministères éducatifs

Un module de paramétrage pour l'éducation nationale (DGESCO) et l'enseignement supérieur (MOSS), permet ensuite de sélectionner les formations éligibles à Parcoursup et Affelnet.
Les instructeurs en académie sont ensuite sollicités pour valider les formations qui doivent alimenter Parcoursup et Affelnet (module de publication).
Les formations publiées par les instructeurs sont ensuite importées automatiquement par les plateformes.

Plus d'information : https://mission-apprentissage.gitbook.io/catalogue/

## Installation

Cloner le projet puis :

```bash {"id":"01J7NR1Z31X1SZ0KMG9E30KMTF"}
cd server
yarn docker:start
```

L'application est ensuite disponible à l'url : http://localhost/

## Tests

Côté serveur (Mocha):

```bash {"id":"01J7NR1Z31X1SZ0KMG9HX6P8MM"}
cd server
yarn test
```

Côté front (Jest / React Testing library):

```bash {"id":"01J7NR1Z31X1SZ0KMG9NG4E5H2"}
cd ui
yarn test
```
