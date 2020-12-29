# Job d'import des OPCOs pour les formations

Ce job est en charge de retrouve la liste des OPCOs rattachés à chaque formation du catalogue.
Il fait appel à l'api table de correspondances.

## Import

Lors de l'import des OPCOs on met à jour 3 informations :

- La liste des OPCOs pour la formation
- Le statut (code) des OPCOs liés
- Le statut (libellé) des OPCOs liés

## Référentiel & Matching

L'api table de correspondances propose 3 méthodes de matching :

- findIdccsFromCfd qui retrouve les codes IDCC depuis un code diplome.
- findOpcosFromIdccs qui retrouve les opcos depuis une liste de codes IDCCs.
- findOpcosFromCfd, qui fait le lien entre les 2 méthodes précédentes, qui retrouve la liste des OPCOs depuis un code diplome.

## Stats

Le script contient une méthode stats qui permet d'afficher les statistiques d'import des OPCOs.

## Commandes

Pour lancer le script d'import :

```sh
dotenv yarn opco:importer
```

Pour lancer le script de stats :

```sh
dotenv yarn opco:importer:stats
```
