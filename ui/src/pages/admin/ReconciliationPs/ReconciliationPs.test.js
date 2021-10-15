import React from "react";
import ReconciliationPs from "./ReconciliationPs";
import useAuth from "../../../common/hooks/useAuth";
import { renderWithRouter } from "../../../common/utils/testUtils";

import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react-hooks";

const server = setupServer(
  rest.get(/\/api\/auth\/current-session/, (req, res, ctx) => {
    return res(ctx.json({}));
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
  const { result } = renderHook(() => useAuth());

  act(() => {
    // eslint-disable-next-line no-unused-vars
    const [auth, setAuth] = result.current;
    setAuth({
      permissions: { isAdmin: true },
      sub: "test",
      email: "test@apprentissage.beta.gouv.fr",
      academie: "-1",
      account_status: "CONFIRMED",
      roles: ["admin", "user"],
      acl: [],
    });
  });

  const { getAllByText, getByText, getAllByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <ReconciliationPs location={{ search: { defaultMode: "simple" } }} />
    </QueryClientProvider>
  );
  const match = getAllByText(/^Rapprochement des bases Parcoursup et Carif-Oref$/i);
  expect(match).toHaveLength(2);

  await waitFor(() => getByText(/Pour réaliser le rapprochement des bases,/i));
  await waitFor(() => getByText(/FILTRER/i));
  await waitFor(() => getByText(/Exporter/i));

  const cardPsNodes = getAllByTestId("cardps");
  expect(cardPsNodes).toHaveLength(8);

  cardPsNodes.forEach((cardPsNode, index) => {
    expect(cardPsNode).toBeVisible();
  });
});
