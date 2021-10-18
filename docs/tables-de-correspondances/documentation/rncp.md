---
description: RNCP - France Compétences
---

# RNCP - Code fiche Répertoire National des Certifications Professionnelles

## En entrée ?

Un code RNCP dont je recherche les informations détaillées. Défini comme ci-dessous 

* liste les formations professionnelles \(adaptées au marché de l’emploi\)
* dépend du Ministère du travail / France compétence
* utilisé par le Ministère du travail et le Ministère de l’enseignement supérieur, de la recherche et et de l’innovation \(MESRI\).

**Exemple pour le CAP Arts et technique du verre - option décorateur :**

| RNCP521 | CAP - ARTS ET TECHNIQUES DU VERRE OPTION : DECORATEUR SUR VERRE |
| :--- | :--- |
| 521 |  |

## En sortie ?

Ce que je peux récupérer à partir RNCP. 

<table>
  <thead>
    <tr>
      <th style="text-align:left">Nom du champ</th>
      <th style="text-align:left">Description</th>
      <th style="text-align:left">Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">code_rncp</td>
      <td style="text-align:left">La valeur du code RNCP recherch&#xE9;</td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">intitule_diplome</td>
      <td style="text-align:left">Intitul&#xE9; fiche RNCP France Comp&#xE9;tences</td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">cfds</td>
      <td style="text-align:left">Liste des codes formation dipl&#xF4;me associ&#xE9;s</td>
      <td style="text-align:left">[string]</td>
    </tr>
    <tr>
      <td style="text-align:left">date_fin_validite_enregistrement</td>
      <td style="text-align:left">Date de fin de validit&#xE9; de la fiche</td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">active_inactive</td>
      <td style="text-align:left">
        <p>La fiche est-elle toujours en vigueur</p>
        <p>ACTIVE / INACTIVE</p>
      </td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">etat_fiche_rncp</td>
      <td style="text-align:left">
        <p>&#xC9;tat de la fiche pour France comp&#xE9;tences</p>
        <p>Publi&#xE9;e ou pas</p>
      </td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">niveau_europe</td>
      <td style="text-align:left">Niveau europ&#xE9;en, exemple: <em><code>niveau6</code></em>
      </td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">code_type_certif</td>
      <td style="text-align:left">Type de certification Abr&#xE9;viation (valeurs en bas de cette page)</td>
      <td
      style="text-align:left">string | null</td>
    </tr>
    <tr>
      <td style="text-align:left">type_certif</td>
      <td style="text-align:left">Type de certification long</td>
      <td style="text-align:left">string | null</td>
    </tr>
    <tr>
      <td style="text-align:left">ancienne_fiche</td>
      <td style="text-align:left">Liste des anciennes fiches par codes</td>
      <td style="text-align:left">[string] | null</td>
    </tr>
    <tr>
      <td style="text-align:left">nouvelle_fiche</td>
      <td style="text-align:left">Liste des nouvelles fiches par codes</td>
      <td style="text-align:left">[string] | null</td>
    </tr>
    <tr>
      <td style="text-align:left">demande</td>
      <td style="text-align:left">
        <p>&#xC9;tat de la demande aupr&#xE8;s de France Comp&#xE9;tences</p>
        <p>0 ou 1</p>
      </td>
      <td style="text-align:left">number</td>
    </tr>
    <tr>
      <td style="text-align:left">certificateurs</td>
      <td style="text-align:left">Liste des certificateurs avec leur Nom et Siret</td>
      <td style="text-align:left">[object]</td>
    </tr>
    <tr>
      <td style="text-align:left">nsf_code</td>
      <td style="text-align:left">Code NSF</td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">nsf_libelle</td>
      <td style="text-align:left">Libell&#xE9; NSF</td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">romes</td>
      <td style="text-align:left">Liste des codes romes avec leurs libell&#xE9;s</td>
      <td style="text-align:left">[object]</td>
    </tr>
    <tr>
      <td style="text-align:left">blocs_competences</td>
      <td style="text-align:left">Liste des blocs de comp&#xE9;tences</td>
      <td style="text-align:left">[object]</td>
    </tr>
    <tr>
      <td style="text-align:left">voix_acces</td>
      <td style="text-align:left">Liste des voix d&apos;acc&#xE8;s</td>
      <td style="text-align:left">[object]</td>
    </tr>
    <tr>
      <td style="text-align:left">partenaires</td>
      <td style="text-align:left">Liste des partenaires avec leur Nom et Siret</td>
      <td style="text-align:left">[object]</td>
    </tr>
    <tr>
      <td style="text-align:left">type_enregistrement</td>
      <td style="text-align:left">
        <p>// TODO</p>
        <p><em><code>&quot;Enregistrement de droit&quot;</code></em>
        </p>
      </td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">si_jury_ca</td>
      <td style="text-align:left">
        <p>D&#xE9;cision du jury apprentissage</p>
        <p><em><code>Oui</code></em> ou <em><code>Non</code></em>
        </p>
      </td>
      <td style="text-align:left">string</td>
    </tr>
    <tr>
      <td style="text-align:left">eligible_apprentissage</td>
      <td style="text-align:left">Vrai, Faux</td>
      <td style="text-align:left">boolean</td>
    </tr>
    <tr>
      <td style="text-align:left">releated</td>
      <td style="text-align:left">Information CFD, MEFS</td>
      <td style="text-align:left">[Object]</td>
    </tr>
  </tbody>
</table>

## Intégration ? 

### API

Swagger: [https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_rncp](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_rncp)

{% api-method method="post" host="https://tables-correspondances.apprentissage.beta.gouv.fr/api" path="/v1/rncp" %}
{% api-method-summary %}
Récupérer les informations liées à un RNCP 
{% endapi-method-summary %}

{% api-method-description %}
Cette API vous permet de récupérer les informations relatives à un code RNCP.   
Appels sous-jacents aux données France Compétences, tables BCN V et N formations, MEF, référentiel RNCP
{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-body-parameters %}
{% api-method-parameter name="rncp" type="string" required=true %}

{% endapi-method-parameter %}
{% endapi-method-body-parameters %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
RNCP successfully retrieved.
{% endapi-method-response-example-description %}

```javascript

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

#### Exemple:

[https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/\#/Outils/post\_rncp](https://tables-correspondances.apprentissage.beta.gouv.fr/api/v1/docs/#/Outils/post_rncp)

![](../../.gitbook/assets/image%20%281%29.png)

### SDK

```javascript
// TODO
```

## Annexes



**code\_certif :**  BUT, DUT, Formation professionnelle,Formations  des écoles d'ingénieurs, Certificat de Spécialisation Agricole, BPJEPS, Sous-officier,Titre professionnel, Autre, MASTER,BP,BTS, Licence Professionnelle,Titre ingénieur,null,BAC PRO, LICENCE,BEPA,CAP,TP,BT,MC4,MC5,BEES,DIPLOVIS,BMA,BEP,DipViGrM,BTSA,DGE\_GM,BAPAAT,DEUST,BTSMarit,DE,CS,CAPA,BPA,BTA,DOCTORAT,BEATEP,Grade\_Master,DEAVS,DMA,DEDPAD,CAPD,CEAV,BTn,DSTS,CP,DNMADE,DEA,Grade\_Licence,DEEA 

Exemple de **bloc de compétences** 

```javascript
{
  "numero_bloc": "RNCP34826BC04",
  "intitule": "Accompagnement éducatif budgétaire",
  "liste_competences": "<p>C2.B1 Analyser les besoins d’un public   </p><p>   <br>C2.4 Mettre en œuvre un accompagnement éducatif budgétaire      </p>",
  "modalites_evaluation": "<p>Evaluer la capacité du candidat à: </p><p>Mettre en œuvre un accompagnement éducatif   budgétaire <br>Analyser la mise en œuvre de l’accompagnement   <br><br><br>Etude d’une situation d’accompagnement éducatif budgétaire   <br></p><p>Coefficient: <br>Ecrit: 1     <br></p><p>Durée de l'épreuve : 3 heures   <br></p><p>Evaluateurs/examinateurs :<br>- un formateur ou un universitaire et un professionnel confirmé du secteur     </p><p>Evaluation organisée par l'établissement de formation</p>"
},
{
  "numero_bloc": "RNCP34826BC05",
  "intitule": "Expression et communication écrite et orale",
  "liste_competences": "<p>C3.1 Elaborer une stratégie de communication à destination de différents publics  </p>",
  "modalites_evaluation": "<p>bloc de compétences validé en brevet de technicien supérieur « économie sociale familiale »</p>"
},
```

