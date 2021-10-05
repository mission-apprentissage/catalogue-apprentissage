import React from "react";
import Perimetre from "./Perimetre";
import { renderWithRouter } from "../../common/utils/testUtils";

import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { fireEvent, waitFor } from "@testing-library/react";

const server = setupServer(
  rest.get(/\/api\/v1\/entity\/perimetre\/regles\/integration\/count/, (req, res, ctx) => {
    return res(ctx.json({ nbRules: 2, nbFormations: 100 }));
  }),
  rest.get(/\/api\/v1\/entity\/perimetre\/niveau/, (req, res, ctx) => {
    return res(
      ctx.json([
        {
          niveau: { value: "1", count: 10 },
          diplomes: [
            { value: "bts", count: 8 },
            { value: "cap", count: 30 },
          ],
        },
      ])
    );
  }),
  rest.get(/\/api\/v1\/entity\/perimetre\/regles/, (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.get(/\/api\/v1\/entity\/messageScript/, (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.get(/\/api\/v1\/entity\/perimetre\/regle\/count/, (req, res, ctx) => {
    return res(ctx.json(39));
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ turns retries off
      retry: false,
    },
  },
});

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("renders basic tree", async () => {
  const { getAllByText, getByText, getAllByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <Perimetre plateforme={"parcoursup"} />
    </QueryClientProvider>
  );
  const match = getAllByText(/^Règles d'intégration des formations à la plateforme parcoursup$/i);
  expect(match).toHaveLength(2);

  await waitFor(() => getByText(/Afficher les conditions :/i));

  const modalButton = getByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  expect(modalButton).toBeInTheDocument();

  await waitFor(() =>
    getByText(/^2 diplômes et titres doivent ou peuvent intégrer la plateforme ce qui représente 100 formations$/i)
  );

  const diplomeLabel = getByText(/^bts$/i);
  expect(diplomeLabel).toBeInTheDocument();

  const diplomesSorted = ["cap", "bts"];
  const lineTitleNodes = getAllByTestId("line");
  lineTitleNodes.forEach((lineTitleNode, index) => {
    expect(lineTitleNode.textContent).toBe(diplomesSorted[index]);
  });
});

test("opens rule modal to add a diploma", async () => {
  const { getByText, queryByText } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <Perimetre plateforme={"parcoursup"} />
    </QueryClientProvider>
  );

  await waitFor(() => getByText(/Afficher les conditions :/i));

  const modalButton = getByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  expect(modalButton).toBeInTheDocument();

  let diplomaLabel = queryByText(/^Nom du diplôme ou titre$/i);
  expect(diplomaLabel).not.toBeInTheDocument();

  fireEvent(
    modalButton,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  diplomaLabel = queryByText(/^Nom du diplôme ou titre$/i);
  expect(diplomaLabel).toBeInTheDocument();

  const closeButton = getByText(/^fermer$/i);
  expect(closeButton).toBeInTheDocument();

  fireEvent(
    closeButton,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  diplomaLabel = queryByText(/^Nom du diplôme ou titre$/i);
  expect(diplomaLabel).not.toBeVisible();
});
