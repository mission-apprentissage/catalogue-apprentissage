import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HowToAddModal } from "./HowToAddModal";

test("should render the informative modal", () => {
  const onClose = jest.fn();
  const { queryByText } = render(<HowToAddModal isOpen={true} onClose={onClose} />);

  const title = queryByText("Demander l'ajout d'une formation");
  expect(title).toBeInTheDocument();

  const closeBtn = queryByText(/fermer/i);
  expect(closeBtn).toBeInTheDocument();
  userEvent.click(closeBtn);
  expect(onClose).toHaveBeenCalled();
});
