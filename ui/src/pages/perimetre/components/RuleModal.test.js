import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { getDiplomesAllowedForSubRulesUrl, RuleModal } from "./RuleModal";
import { fireEvent, render } from "@testing-library/react";

const server = setupServer(
  rest.get(/\/api\/v1\/entity\/perimetre\/niveau/, (req, res, ctx) => {
    return res(ctx.json([{ niveau: { value: "1", count: 10 }, diplomes: [{ value: "bts" }] }]));
  }),
  rest.get(/\/api\/v1\/entity\/perimetre\/regles/, (req, res, ctx) => {
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

test("should compute an url filtering with status 'à publier soumis à validation du recteur' for parcoursup", () => {
  const result = getDiplomesAllowedForSubRulesUrl("parcoursup");
  expect(result).toEqual(
    `${process.env.REACT_APP_BASE_URL}/api/v1/entity/perimetre/regles?plateforme=parcoursup&nom_regle_complementaire=null&statut=%C3%A0+publier+%28soumis+%C3%A0+validation+Recteur%29`
  );
});

test("should compute an url filtering with condition 'peut intégrer' for affelnet", () => {
  const result = getDiplomesAllowedForSubRulesUrl("affelnet");
  expect(result).toEqual(
    `${process.env.REACT_APP_BASE_URL}/api/v1/entity/perimetre/regles?plateforme=affelnet&nom_regle_complementaire=null&condition_integration=peut+int%C3%A9grer`
  );
});

test("renders the modal in creation mode for psup", async () => {
  const onClose = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();
  const onCreateRule = jest.fn();

  const { queryByText } = render(
    <QueryClientProvider client={queryClient}>
      <RuleModal
        plateforme={"parcoursup"}
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

  const deleteButton = queryByText(/^Supprimer$/i);
  expect(deleteButton).not.toBeInTheDocument();

  const anneeField = queryByText(/^Année d'entrée en apprentissage$/i);
  expect(anneeField).toBeInTheDocument();
});

test("renders the modal in creation mode for affelnet", async () => {
  const onClose = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();
  const onCreateRule = jest.fn();

  const { queryByText } = render(
    <QueryClientProvider client={queryClient}>
      <RuleModal
        plateforme={"affelnet"}
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

  const deleteButton = queryByText(/^Supprimer$/i);
  expect(deleteButton).not.toBeInTheDocument();

  const anneeField = queryByText(/^Année d'entrée en apprentissage$/i);
  expect(anneeField).toBeInTheDocument();
});

test("renders the modal in update mode and can delete", async () => {
  window.confirm = jest.fn(() => true); // always click 'yes'

  const onClose = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();
  const onCreateRule = jest.fn();

  const rule = {
    _id: "999",
    diplome: "BTS",
    regle_complementaire: "",
    regle_complementaire_query: "",
    nom_regle_complementaire: "mon diplome de test",
    statut: "à publier",
    condition_integration: "peut intégrer",
    niveau: "4",
    duree: "1",
  };
  const { queryByText } = render(
    <QueryClientProvider client={queryClient}>
      <RuleModal
        plateforme={"parcoursup"}
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

  const deleteButton = queryByText(/^Supprimer$/i);
  expect(deleteButton).toBeInTheDocument();

  fireEvent(
    deleteButton,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  expect(window.confirm).toBeCalled();
  expect(onDeleteRule).toBeCalledWith({ _id: "999" });
});
