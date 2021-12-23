import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { renderHook } from "@testing-library/react-hooks";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { useNiveaux } from "./perimetre";

const server = setupServer(
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

const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("test custom hook", async () => {
  const { result, waitFor } = renderHook(() => useNiveaux({ plateforme: "parcoursup" }), { wrapper });

  await waitFor(() => result.current.isSuccess);

  expect(result.current.data).toEqual([
    {
      niveau: { value: "1", count: 10 },
      diplomes: [
        { value: "bts", count: 8 },
        { value: "cap", count: 30 },
      ],
    },
  ]);
});
