import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HowToAddModal } from "./HowToAddModal";

it("should render the informative modal", async () => {
  const onClose = jest.fn();
  const { queryByText } = render(<HowToAddModal isOpen={true} onClose={onClose} />);

  const title = queryByText("Demander l'ajout d'une formation");
  expect(title).toBeInTheDocument();

  const closeBtn = queryByText(/fermer/i);
  expect(closeBtn).toBeInTheDocument();

  await userEvent.click(closeBtn);

  expect(onClose).toHaveBeenCalled();
});
