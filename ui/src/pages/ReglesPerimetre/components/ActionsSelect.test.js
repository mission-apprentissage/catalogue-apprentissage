import React from "react";
import { render } from "@testing-library/react";
import { ActionsSelect } from "./ActionsSelect";
import userEvent from "@testing-library/user-event";

test("renders all conditions", () => {
  const onChange = jest.fn();

  const { getByText, getByTestId } = render(<ActionsSelect onChange={onChange} />);

  let option = getByText(/^doit intégrer$/i);
  expect(option).toBeInTheDocument();

  option = getByText(/^peut intégrer$/i);
  expect(option).toBeInTheDocument();

  option = getByText(/^ne doit pas intégrer$/i);
  expect(option).toBeInTheDocument();

  userEvent.selectOptions(getByTestId("actions-select"), ["peut intégrer"]);
  expect(onChange).toHaveBeenCalled();
});
