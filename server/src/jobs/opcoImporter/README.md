# Job d'import des OPCOs pour les formations

Ce job est en charge de retrouve la liste des OPCOs rattachés à chaque formation du catalogue.
Il utilise un référentiel composé de 2 fichiers sources présents dans le dossier assets.

## Assets

Ce dossier contient

- Le fichier referentielCodesIdccOpco.csv listant tous les liens entre IDCC et OPCO.

## Azure Storage

Un deuxieme fichier est nécessaire au script d'import des OPCOs : referentielCodesEnCodesIdcc.csv
Ce fichier étant trop volumineux il est stocké dans un Storage Azure et est téléchargé automatiquement vers le dossier assets.

## Import

Lors de l'import des OPCOs on mets à jour 3 informations :

- La liste des OPCOs pour la formation
- Le statut (code) des OPCOs liés
- Le statut (libellé) des OPCOs liés

## Référentiel & Matching

Le module référentiel propose 3 méthodes de matching :

- findIdccsFromCodeEn qui retrouve les codes IDCC depuis un code diplome (EN).
- findOpcosFromIdccs qui retrouve les opcos depuis une liste de codes IDCCs.
- findOpcosFromCodeEn, qui fait le lien entre les 2 méthodes précédentes, qui retrouve la liste des OPCOs depuis un code diplome (EN).

## Stats

Le script contient une méthode stats qui permet d'afficher les statistiques d'import des OPCOs.

## Environnement & tests unitaires

Le script utilise dotEnv pour la gestion des variables d'environnements.

Pour lancer le script d'import :

```sh
dotenv yarn opco:importer
```

Pour lancer le script de stats :

```sh
dotenv yarn opco:importer:stats
```
