import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsSelect } from "./ActionsSelect";

test("renders all conditions", () => {
  const onChange = jest.fn();

  const { getByText } = render(<ActionsSelect onChange={onChange} />);

  let option = getByText(/^doit intégrer$/i);
  expect(option).toBeInTheDocument();

  option = getByText(/^peut intégrer$/i);
  expect(option).toBeInTheDocument();

  option = getByText(/^ne doit pas intégrer$/i);
  expect(option).toBeInTheDocument();
});

test("calls onChange", async () => {
  const onChange = jest.fn();

  const { getByTestId } = render(<ActionsSelect onChange={onChange} />);

  await userEvent.selectOptions(getByTestId("actions-select"), ["peut intégrer"]);

  expect(onChange).toHaveBeenCalled();
});
