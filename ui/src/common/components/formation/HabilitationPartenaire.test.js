import React from "react";
import { HabilitationPartenaire } from "./HabilitationPartenaire";
import { render } from "@testing-library/react";

test("should display 'ORGANISER ET FORMER'", () => {
  const { queryByText } = render(<HabilitationPartenaire habilitation={"HABILITATION_ORGA_FORM"} />);

  const title = queryByText("ORGANISER ET FORMER");
  expect(title).toBeInTheDocument();
  expect(title).toHaveStyle("color: green");
});

test("should display 'FORMER'", () => {
  const { queryByText } = render(<HabilitationPartenaire habilitation={"HABILITATION_FORMER"} />);

  const title = queryByText("FORMER");
  expect(title).toBeInTheDocument();
  expect(title).toHaveStyle("color: green");
});

test("should display 'ORGANISER'", () => {
  const { queryByText } = render(<HabilitationPartenaire habilitation={"HABILITATION_ORGANISER"} />);

  const title = queryByText("ORGANISER");
  expect(title).toBeInTheDocument();
  expect(title).toHaveStyle("color: red");
});

test("should display param if unknown", () => {
  const { queryByText } = render(<HabilitationPartenaire habilitation={"HABILITATION_ORGANISER_UNKNOWN"} />);

  const title = queryByText("HABILITATION_ORGANISER_UNKNOWN");
  expect(title).toBeInTheDocument();
});
