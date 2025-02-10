import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { rest } from "msw";
import { grantAdminAccess, renderWithRouter, setupMswServer } from "../../common/utils/testUtils";
import Plateforme from "./Plateforme";
import { PLATEFORME } from "../../constants/plateforme";

jest.setTimeout(20000);

const server = setupMswServer(
  rest.get(/\/api\/entity\/perimetre\/regles\/integration\/count/, (req, res, ctx) => {
    return res(ctx.json({ nbRules: 2, nbFormations: 100 }));
  }),
  rest.get(/\/api\/entity\/perimetre\/niveau/, (req, res, ctx) => {
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
  rest.get(/\/api\/entity\/perimetre\/regles/, (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.get(/\/api\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json([]));
  }),
  rest.get(/\/api\/entity\/perimetre\/regle\/count/, (req, res, ctx) => {
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

it("renders basic tree for Parcoursup plateform when admin", async () => {
  grantAdminAccess({});

  const { getAllByText, getByText } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <Plateforme plateforme={PLATEFORME.PARCOURSUP} />
    </QueryClientProvider>
  );

  const match = getAllByText(/^Règles d'intégration des formations à la plateforme Parcoursup$/i);
  expect(match).toHaveLength(2);

  await waitFor(() => getByText(/Afficher les conditions :/i));

  const niveau = getByText("Niveau 1");
  expect(niveau).toBeInTheDocument();

  // const modalButton = getByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  // expect(modalButton).toBeInTheDocument();

  // await waitFor(() =>
  //   getByText(/^2 diplômes et titres doivent ou peuvent intégrer la plateforme ce qui représente 100 formations$/i)
  // );

  const diplomeLabel = getByText(/^bts$/i);
  expect(diplomeLabel).toBeInTheDocument();
});

it("renders basic tree for Affelnet plateform when admin", async () => {
  grantAdminAccess({});

  const { getAllByText, getByText } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <Plateforme plateforme={PLATEFORME.AFFELNET} />
    </QueryClientProvider>
  );

  const match = getAllByText(/^Règles d’intégration des formations en apprentissage dans Affelnet-lycée$/i);
  expect(match).toHaveLength(2);

  await waitFor(() => getByText(/Afficher les conditions :/i));

  const niveau = getByText("Niveau 1");
  expect(niveau).toBeInTheDocument();

  // const modalButton = getByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  // expect(modalButton).toBeInTheDocument();

  // await waitFor(() =>
  //   getByText(/^2 diplômes et titres doivent ou peuvent intégrer la plateforme ce qui représente 100 formations$/i)
  // );

  const diplomeLabel = getByText(/^bts$/i);
  expect(diplomeLabel).toBeInTheDocument();
});

it.skip("opens rule modal to add a diploma", async () => {
  grantAdminAccess({});

  const { getByText, queryByText } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <Plateforme plateforme={PLATEFORME.AFFELNET} />
    </QueryClientProvider>
  );

  await waitFor(() => getByText(/Afficher les conditions :/i));

  const modalButton = getByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  expect(modalButton).toBeInTheDocument();

  let diplomaLabel = queryByText(/^Nom du diplôme ou titre$/i);
  expect(diplomaLabel).not.toBeInTheDocument();

  await userEvent.click(modalButton);

  diplomaLabel = queryByText(/^Nom du diplôme ou titre$/i);
  expect(diplomaLabel).toBeInTheDocument();
});
