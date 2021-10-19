# Glossaires Codes et tutti quanti

## **Code formation diplôme \(CFD - code Éducation Nationale\)**

* liste les formations qui existent de droit et reconnues par l'état
* dépend du ministère de l'Education Nationale
* utilisé par Ministère de l’éducation nationale et de la jeunesse \(MENJ\) et le Ministère de l’enseignement supérieur, de la recherche et de l’innovation \(MESRI\)
* Ce code est forcément sur **8 caractères alphanumériques**

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

<table>
  <thead>
    <tr>
      <th style="text-align:left">
        <p>CDF</p>
        <p></p>
      </th>
      <th style="text-align:left">
        <p>50022427</p>
        <p>(<a href="http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/V_FORMATION_DIPLOME">table</a>)</p>
      </th>
      <th style="text-align:left">ARTS ET TECHNIQUES DU VERRE OPTION DECORATEUR (CAP)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">500</td>
      <td style="text-align:left">Niveau formation dipl&#xF4;me (<a href="http://infocentre.pleiade.education.fr/bcn/index.php/workspace/viewTable/n/N_NIVEAU_FORMATION_DIPLOME/nbElements/20">table</a>)</td>
      <td
      style="text-align:left">
        <p>CERTIFICAT D&apos;APTITUDES PROFESSIONNELLES</p>
        <p><em>! la table des niveau n&#x2019;est pas &#xE0; jour</em>
        </p>
        </td>
    </tr>
    <tr>
      <td style="text-align:left">224</td>
      <td style="text-align:left">Groupe sp&#xE9;cialit&#xE9; ou NSF (<a href="http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_GROUPE_SPECIALITE">table</a>)</td>
      <td
      style="text-align:left">MATERIAUX DE CONSTRUCTION, VERRE, CERAM.</td>
    </tr>
    <tr>
      <td style="text-align:left">27</td>
      <td style="text-align:left">Num&#xE9;ro d&#x2019;ordre</td>
      <td style="text-align:left"></td>
    </tr>
  </tbody>
</table>

## **Code MEF**

* liste les formations qui existent de droit et reconnues par l'état
* dépend du ministère de l'Education Nationale
* utilisé par Parcoursup et Affelnet car plus précis que le code formation diplôme, données supplémentaires : durée de formation et année sur laquelle on s'inscrit

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

| MEF  | 2402242711 \([table](http://infocentre.pleiade.education.fr/bcn/index.php/workspace/viewTable/n/N_MEF/nbElements/20)\) | 1CAP1 ARTS & TECH.VERRE: DECORATEUR |
| :--- | :--- | :--- |
| 240 | Dispositif formation \([table](http://infocentre.pleiade.education.fr/bcn/index.php/workspace/viewTable/n/N_DISPOSITIF_FORMATION/nbElements/20)\) | CAP EN 1 AN |
| 224 | Groupe spécialité ou NSF \([table](http://infocentre.pleiade.education.fr/bcn/workspace/viewTable/n/N_GROUPE_SPECIALITE)\) | MATERIAUX DE CONSTRUCTION, VERRE, CERAM. |
| 27 | Numéro d’ordre | ?? |
| 1 | Durée | 1 an |
| 1 | Année | 1ère année |

## **Code fiche RNCP**

* liste les formations professionnelles \(adaptées au marché de l’emploi\)
* dépend du Ministère du travail / France compétence
* utilisé par le Ministère du travail et le Ministère de l’enseignement supérieur, de la recherche et et de l’innovation \(MESRI\).

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

| RNCP521 | CAP - ARTS ET TECHNIQUES DU VERRE OPTION : DECORATEUR SUR VERRE |
| :--- | :--- |
| 521 |  |

## **Code Rome**

* liste les familles de métiers
* dépend du Ministère du Travail / Pôle-emploi
* utilisé par le Ministère du Travail , Pôle-emploi, les Missions Locales et les OPCO

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

| B1602 |  | Réalisation d'objets artistiques et fonctionnels en verre |
| :--- | :--- | :--- |
| B | Famille de métier | Arts et Façonnage d'ouvrages d'art |
| B16 | Domaine professionnel | Métal, verre, bijouterie et horlogerie |

## **Code NAF**

* liste les types d'activités économiques productives
* dépend du Ministère du travail

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

| NAF |  |
| :--- | :--- |
| 23 | Fabrication d'autres produits minéraux non métalliques |
| 32 | Autres industries manufacturières |

## **Correspondances**

|  | CFD | MEF | NSF | RNCP | ROME | NAF |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CFD | / | **oui** | **oui** | **oui** | **oui** | non |
| Code MEF | **oui** | / | **oui** | **oui** | non | non |
| Code NSF | **oui** | **oui** | / | **oui** | non | non |
| Code fiche RNCP | **oui** | **oui** | **oui** | / | **oui** | non |
| Code ROME | **oui** | non | non | **oui** | / | **oui** |
| Code NAF | non | non | non | non | **oui** | / |

