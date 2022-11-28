import React from "react";
import ActionsExpertes from "./ActionsExpertes";
import { renderWithRouter, setupMswServer } from "../../common/utils/testUtils";

import { rest } from "msw";
import { setAuthState } from "../../common/auth";
import { waitFor } from "@testing-library/react";
import * as search from "../../common/hooks/useSearch";

const server = setupMswServer(
  rest.get(/\/api\/entity\/formations\/count/, (req, res, ctx) => {
    return res(ctx.json(1000));
  }),

  rest.get(/\/api\/v1\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("renders all actions for admin", async () => {
  setAuthState({ permissions: { isAdmin: true } });

  const { getByText, getByTestId } = renderWithRouter(<ActionsExpertes />);

  await waitFor(() => getByTestId("grid"));

  const perimetrePsLink = getByText(/^Règles d'intégration des formations à la plateforme Parcoursup$/i);
  expect(perimetrePsLink).toBeInTheDocument();

  const perimetreAfLink = getByText(/^Règles d'intégration des formations à la plateforme Affelnet$/i);
  expect(perimetreAfLink).toBeInTheDocument();
});

test("renders ps actions for acl ps", async () => {
  setAuthState({ permissions: { isAdmin: false }, acl: ["page_perimetre_ps"] });

  const { queryByText, getByTestId } = renderWithRouter(<ActionsExpertes />);

  await waitFor(() => getByTestId("grid"));

  const perimetrePsLink = queryByText(/^Règles d'intégration des formations à la plateforme Parcoursup$/i);
  expect(perimetrePsLink).toBeInTheDocument();

  const perimetreAfLink = queryByText(/^Règles d'intégration des formations à la plateforme Affelnet$/i);
  expect(perimetreAfLink).not.toBeInTheDocument();
});

test("renders af actions for acl af", async () => {
  setAuthState({ permissions: { isAdmin: false }, acl: ["page_perimetre_af"] });

  const { queryByText, getByTestId } = renderWithRouter(<ActionsExpertes />);

  await waitFor(() => getByTestId("grid"));

  const perimetrePsLink = queryByText(/^Règles d'intégration des formations à la plateforme Parcoursup$/i);
  expect(perimetrePsLink).not.toBeInTheDocument();

  const perimetreAfLink = queryByText(/^Règles d'intégration des formations à la plateforme Affelnet$/i);
  expect(perimetreAfLink).toBeInTheDocument();
});
