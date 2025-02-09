import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { downloadCSV } from "../../../common/utils/downloadUtils";
import { ExportButton } from "./ExportButton";
import { PARCOURSUP_STATUS } from "../../../constants/status";
import { PLATEFORME } from "../../../constants/plateforme";

jest.mock("../../../common/utils/downloadUtils", () => {
  const originalModule = jest.requireActual("../../../common/utils/downloadUtils");
  return {
    __esModule: true,
    ...originalModule,
    downloadCSV: jest.fn(),
  };
});

it("renders button", () => {
  const { getByText } = render(<ExportButton plateforme={PLATEFORME.PARCOURSUP} rules={[]} />);

  const button = getByText(/^Exporter$/i);
  expect(button).toBeInTheDocument();
});

it("should call exportCSV on click", () => {
  const rules = [
    {
      niveau: "3",
      diplome: "BTS",
      statut: PARCOURSUP_STATUS.A_PUBLIER,
      statut_academies: {
        1: "autre statut",
      },
    },
  ];
  const { getByText } = render(<ExportButton plateforme={PLATEFORME.PARCOURSUP} rules={rules} />);
  const button = getByText(/^Exporter$/i);

  fireEvent(
    button,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  expect(downloadCSV).toHaveBeenCalled();

  expect(downloadCSV.mock.calls[0][1]).toEqual(
    "Niveau;Diplome (BCN);Nom du diplome ou titre;Condition d'integration;Statut;Derniere mise a jour;Dernier contributeur;Statuts spécifiques en académies;Règles complémentaires\n" +
      '3;BTS;;;à publier;;;="Paris:autre statut";'
  );
});
