import React from "react";
import { waitForElementToBeRemoved } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithRouter, setupMswServer } from "../common/utils/testUtils";
import { rest } from "msw";

const server = setupMswServer(
  rest.get(/\/api\/entity\/etablissements\/count/, (req, res, ctx) => {
    return res(ctx.json(150));
  }),
  rest.get(/\/api\/entity\/formations\/count/, (req, res, ctx) => {
    return res(ctx.json(8900));
  }),
  rest.get(/\/api\/v1\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("renders title", () => {
  const { getByText } = renderWithRouter(<HomePage />);
  const title = getByText(/^Catalogue des offres de formations en apprentissage$/i);
  expect(title).toBeInTheDocument();
});

test("should fetch formations & etablissements counts", async () => {
  const { getByText } = renderWithRouter(<HomePage />);

  await waitForElementToBeRemoved(() => getByText(/chargement/i));

  const countFormations = getByText(/8 900 formations/i);
  expect(countFormations).toBeInTheDocument();

  const countEtablissements = getByText(/150 organismes/i);
  expect(countEtablissements).toBeInTheDocument();
});
