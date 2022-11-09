import React from "react";
import { rest } from "msw";
import { AlertMessage } from "./AlertMessage";
import { render, waitFor } from "@testing-library/react";
import { setupMswServer } from "../../../common/utils/testUtils";

const alerts = [
  {
    enabled: true,
    _id: "alert1",
    type: "automatique",
    msg: "Une mise à jour des données du catalogue est en cours, le service sera à nouveau opérationnel d'ici quelques minutes.",
    name: "auto",
  },
  {
    enabled: false,
    _id: "alert2",
    type: "manuel",
    name: "marc.andre@beta.gouv.fr",
    msg: "Avis aux organismes et CFA — Selon les jours d'enregistrement au niveau de votre Carif-Oref, l'affichage sur le catalogue est effectif 7 à 11 jours après (7 jours si l'offre est enregistrée le vendredi, 11 jours si l'offre est enregistrée le lundi). Passé ce délai, vous pouvez contacter votre Carif-Oref pour signalement.",
    time: "2022-04-12T09:30:52.253Z",
  },
  {
    enabled: true,
    _id: "alert3",
    type: "manuel",
    name: "marc.andre@beta.gouv.fr",
    msg: "Avis aux organismes et CFA — Suite au changement de langage Lhéo, les derniers ajustements nécessaires pour alimenter le catalogue des formations en apprentissage, tout en assurant la continuité des informations transmises précédemment sont en cours. Les formations collectées auprès des Carif-Oref, notamment pour la rentrée 2023-2024, seront bientôt visibles. Merci de votre compréhension. ",
    time: "2022-10-12T06:59:33.484Z",
  },
];

const server = setupMswServer(
  rest.get(/\/api\/v1\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json(alerts));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("renders alerts", async () => {
  const { getByTestId, queryByTestId } = render(<AlertMessage />);

  await waitFor(() => getByTestId("container"));

  const container = queryByTestId("container");
  expect(container).toBeInTheDocument();

  const alert1 = queryByTestId("alert1");
  expect(alert1).toBeInTheDocument();

  const alert2 = queryByTestId("alert2");
  expect(alert2).not.toBeInTheDocument();

  const alert3 = queryByTestId("alert3");
  expect(alert3).toBeInTheDocument();
});
