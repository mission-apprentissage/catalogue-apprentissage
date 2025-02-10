import { rest } from "msw";
import { QueryClient, QueryClientProvider } from "react-query";
import { userEvent } from "@testing-library/user-event";
import { getDiplomesAllowedForSubRulesUrl, RuleModal } from "./RuleModal";
import { PARCOURSUP_STATUS } from "../../../constants/status";
import { setupMswServer, renderWithRouter } from "../../../common/utils/testUtils";
import { PLATEFORME } from "../../../constants/plateforme";

const server = setupMswServer(
  rest.get(/\/api\/entity\/perimetre\/niveau/, (req, res, ctx) => {
    return res(ctx.json([{ niveau: { value: "1", count: 10 }, diplomes: [{ value: "bts" }] }]));
  }),
  rest.get(/\/api\/entity\/perimetre\/regles/, (req, res, ctx) => {
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

it("should compute an url filtering with status 'à publier soumis à validation du recteur' for parcoursup", () => {
  const result = getDiplomesAllowedForSubRulesUrl(PLATEFORME.PARCOURSUP);
  expect(result).toEqual(
    `${process.env.REACT_APP_BASE_URL}/api/entity/perimetre/regles?plateforme=parcoursup&nom_regle_complementaire=null&statut=%C3%A0+publier+%28soumis+%C3%A0+validation+Recteur%29`
  );
});

it("should compute an url filtering with condition 'peut intégrer' for affelnet", () => {
  const result = getDiplomesAllowedForSubRulesUrl("affelnet");
  expect(result).toEqual(
    `${process.env.REACT_APP_BASE_URL}/api/entity/perimetre/regles?plateforme=affelnet&nom_regle_complementaire=null&condition_integration=peut+int%C3%A9grer`
  );
});

it("renders the modal in creation mode for psup", async () => {
  const onClose = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();
  const onCreateRule = jest.fn();

  const { queryByText, queryByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <RuleModal
        plateforme={PLATEFORME.PARCOURSUP}
        isOpen={true}
        onClose={onClose}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        onCreateRule={onCreateRule}
        academie={12}
      />
    </QueryClientProvider>
  );

  const title = queryByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  expect(title).toBeInTheDocument();

  const deleteButton = queryByTestId("delete-button");
  expect(deleteButton).not.toBeInTheDocument();

  const anneeField = queryByText(/^Année d'entrée en apprentissage$/i);
  expect(anneeField).toBeInTheDocument();
});

it("renders the modal in creation mode for affelnet", async () => {
  const onClose = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();
  const onCreateRule = jest.fn();

  const { queryByText, queryByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <RuleModal
        plateforme={PLATEFORME.AFFELNET}
        isOpen={true}
        onClose={onClose}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        onCreateRule={onCreateRule}
        academie={12}
      />
    </QueryClientProvider>
  );

  const title = queryByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  expect(title).toBeInTheDocument();

  const deleteButton = queryByTestId("delete-button");
  expect(deleteButton).not.toBeInTheDocument();

  const anneeField = queryByText(/^Année d'entrée en apprentissage$/i);
  expect(anneeField).toBeInTheDocument();
});

it("renders the modal in update mode and can delete", async () => {
  window.confirm = jest.fn(() => true); // always click 'yes'

  const onClose = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();
  const onCreateRule = jest.fn();

  const rule = {
    _id: "999",
    diplome: "BTS",
    regle_complementaire: "",
    regle_complementaire_query: "[]",
    nom_regle_complementaire: "mon diplome de test",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    condition_integration: "peut intégrer",
    niveau: "4",
    duree: "1",
  };
  const { queryByText, getByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <RuleModal
        plateforme={PLATEFORME.PARCOURSUP}
        isOpen={true}
        onClose={onClose}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        onCreateRule={onCreateRule}
        rule={rule}
      />
    </QueryClientProvider>
  );

  const titleCreation = queryByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  expect(titleCreation).not.toBeInTheDocument();

  const titleUpdate = queryByText(/^mon diplome de test$/i);
  expect(titleUpdate).toBeInTheDocument();

  const deleteButton = getByTestId("delete-button");
  expect(deleteButton).toBeInTheDocument();

  await userEvent.click(deleteButton);

  expect(window.confirm).toBeCalled();
  expect(onDeleteRule).toBeCalledWith({ _id: "999" });
});

it("renders the modal and can close", async () => {
  window.confirm = jest.fn(() => true); // always click 'yes'

  const onClose = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();
  const onCreateRule = jest.fn();

  const rule = {
    _id: "999",
    diplome: "BTS",
    regle_complementaire: "",
    regle_complementaire_query: "[]",
    nom_regle_complementaire: "mon diplome de test",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    condition_integration: "peut intégrer",
    niveau: "4",
    duree: "1",
  };
  const { queryByText, getByTestId } = renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <RuleModal
        plateforme={PLATEFORME.PARCOURSUP}
        isOpen={true}
        onClose={onClose}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        onCreateRule={onCreateRule}
        rule={rule}
      />
    </QueryClientProvider>
  );

  const titleCreation = queryByText(/^Ajouter un diplôme, un titre ou des formations$/i);
  expect(titleCreation).not.toBeInTheDocument();

  const titleUpdate = queryByText(/^mon diplome de test$/i);
  expect(titleUpdate).toBeInTheDocument();

  const closeButton = getByTestId("close-button");
  expect(closeButton).toBeInTheDocument();

  await userEvent.click(closeButton);

  expect(onClose).toBeCalled();
});
