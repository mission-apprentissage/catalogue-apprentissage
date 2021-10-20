import React from "react";
import { render } from "@testing-library/react";
import { CountText } from "./CountText";
import * as api from "../../../common/api/perimetre";

test("renders count text for national", () => {
  jest.spyOn(api, "useIntegrationCount").mockImplementation(() => ({
    data: {
      nbFormations: 21290,
      nbRules: 38,
    },
  }));

  const niveaux = [
    {
      value: "1",
      diplomes: [
        { value: "BTS", regles: [] },
        { value: "TH5", regles: [] },
      ],
    },
    {
      value: "2",
      diplomes: [
        { value: "Master", regles: [] },
        {
          value: "Licence Pro",
          regles: [{ nom_regle_complementaire: "Licence Agri" }, { nom_regle_complementaire: null }],
        },
      ],
    },
  ];

  const { queryByText } = render(
    <CountText totalFormationsCount={31000} plateforme={"parcoursup"} niveaux={niveaux} />
  );

  const text = queryByText(
    "Actuellement au national, 38 diplômes ou titres en apprentissage (21290 formations) doivent ou peuvent intégrer la plateforme parcoursup sur les 5 recensés (31000 formations) dans le Catalogue général."
  );
  expect(text).toBeInTheDocument();
});

test("renders count text for academy", () => {
  jest.spyOn(api, "useIntegrationCount").mockImplementation(() => ({
    data: {
      nbFormations: 21290,
      nbRules: 38,
    },
  }));

  const niveaux = [
    {
      value: "1",
      diplomes: [
        { value: "BTS", regles: [] },
        { value: "TH5", regles: [] },
      ],
    },
    {
      value: "2",
      diplomes: [
        { value: "Master", regles: [] },
        {
          value: "Licence Pro",
          regles: [{ nom_regle_complementaire: "Licence Agri" }, { nom_regle_complementaire: null }],
        },
      ],
    },
  ];

  const { queryByText } = render(
    <CountText totalFormationsCount={31000} plateforme={"parcoursup"} niveaux={niveaux} academie={"14"} />
  );

  const text = queryByText(
    "Actuellement pour l'académie de Rennes, 38 diplômes ou titres en apprentissage (21290 formations) doivent ou peuvent intégrer la plateforme parcoursup sur les 5 recensés (31000 formations) dans le Catalogue général."
  );
  expect(text).toBeInTheDocument();
});
