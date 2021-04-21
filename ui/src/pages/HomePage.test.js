import React from "react";
import HomePage from "./HomePage";
import { renderWithRouter } from "../common/utils/testUtils";

test("renders title", () => {
  const { getByText } = renderWithRouter(<HomePage />);
  const title = getByText(/Catalogue des offres de formations en apprentissage/i);
  expect(title).toBeInTheDocument();
});
