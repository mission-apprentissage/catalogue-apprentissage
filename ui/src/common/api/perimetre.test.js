import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { useNiveaux } from "./perimetre";
import { setupMswServer } from "../utils/testUtils";
import { PLATEFORME } from "../../constants/plateforme";

const server = setupMswServer(
  rest.get(/\/api\/entity\/perimetre\/niveau.*/, (req, res, ctx) => {
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

it("test custom hook", async () => {
  const { result } = renderHook(() => useNiveaux({ plateforme: PLATEFORME.PARCOURSUP }), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

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
