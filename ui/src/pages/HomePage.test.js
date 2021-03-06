import React from "react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithRouter } from "../common/utils/testUtils";
import "@testing-library/jest-dom/extend-expect";

import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  rest.get(/\/api\/entity\/etablissements\/count/, (req, res, ctx) => {
    return res(ctx.json(150));
  }),
  rest.get(/\/api\/entity\/formations2021\/count/, (req, res, ctx) => {
    return res(ctx.json(8900));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("renders title", () => {
  const { getByText } = renderWithRouter(<HomePage />);
  const title = getByText(/Catalogue des offres de formations en apprentissage/i);
  expect(title).toBeInTheDocument();
});

test("should fetch formations & etablissements counts", async () => {
  const { getByText } = renderWithRouter(<HomePage />);

  await waitForElementToBeRemoved(() => getByText(/chargement/i));

  const countFormations = getByText(/8900 formations 2021/i);
  expect(countFormations).toBeInTheDocument();

  const countEtablissements = getByText(/150 établissements/i);
  expect(countEtablissements).toBeInTheDocument();
});
