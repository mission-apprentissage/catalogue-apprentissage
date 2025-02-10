import React from "react";
import { RuleUpdatesHistory } from "./RuleUpdatesHistory";
import { render } from "@testing-library/react";
import { PARCOURSUP_STATUS } from "../../../constants/status";

it("should display the object value in a human friendly way", async () => {
  const ruleHistory = {
    regle_complementaire_query: "La query",
    regle_complementaire: "regle complementaire",
    nom_regle_complementaire: "ma regle de test",
    last_update_who: "mna",
    condition_integration: "peut intégrer",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    diplome: "CAP",
    niveau: "3 BAC",
    unknown_key: "hello",
  };

  const { getByText, queryByText } = render(<RuleUpdatesHistory label={"Avant"} value={ruleHistory} />);

  const queryValue = queryByText(/^La query$/i);
  expect(queryValue).not.toBeInTheDocument();

  let label = getByText(/^Autre\(s\) critère\(s\):$/i);
  expect(label).toBeInTheDocument();
  let value = getByText(/"regle complementaire"$/i);
  expect(value).toBeInTheDocument();

  label = getByText(/^Nom du diplôme ou titre:$/i);
  expect(label).toBeInTheDocument();
  value = getByText(/"ma regle de test"$/i);
  expect(value).toBeInTheDocument();

  label = getByText(/^Modifié par:$/i);
  expect(label).toBeInTheDocument();
  value = getByText(/"mna"$/i);
  expect(value).toBeInTheDocument();

  label = getByText(/^Condition d'intégration:$/i);
  expect(label).toBeInTheDocument();
  value = getByText(/"peut intégrer"$/i);
  expect(value).toBeInTheDocument();

  label = getByText(/^Règle de publication:$/i);
  expect(label).toBeInTheDocument();
  value = getByText(/"à publier"$/i);
  expect(value).toBeInTheDocument();

  label = getByText(/^Type de diplôme ou titre:$/i);
  expect(label).toBeInTheDocument();
  value = getByText(/"CAP"$/i);
  expect(value).toBeInTheDocument();

  label = getByText(/^Niveau:$/i);
  expect(label).toBeInTheDocument();
  value = getByText(/"3 BAC"$/i);
  expect(value).toBeInTheDocument();

  label = getByText(/^unknown_key:$/i);
  expect(label).toBeInTheDocument();
  value = getByText(/"hello"$/i);
  expect(value).toBeInTheDocument();
});
