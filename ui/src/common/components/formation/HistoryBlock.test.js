import React from "react";
import { render } from "@testing-library/react";
import { grantAnonymousAccess } from "../../utils/testUtils";
import { waitFor } from "@testing-library/react";
import { HistoryBlock } from "./HistoryBlock";

const formation = {
  updates_history: [
    {
      from: {
        uai_formation: "0573690B",
      },
      to: {
        uai_formation: "0573690A",
        last_update_who: "no-reply@beta.gouv.fr",
      },
      updated_at: 1643875591935,
    },
    {
      from: {
        uai_formation: "0573690B",
      },
      to: {
        uai_formation: "",
        last_update_who: "no-reply@beta.gouv.fr",
      },
      updated_at: 1643985528488,
    },
    {
      from: {
        rejection: {
          handled_by: null,
          handled_date: null,
        },
      },
      to: {
        last_update_who: "quentin.petel@beta.gouv.fr",
        rejection: {
          handled_by: "quentin.petel@beta.gouv.fr",
          handled_date: "2022-04-15T21:45:52.309Z",
        },
      },
      updated_at: "2022-04-14T21:45:52.309Z",
    },
  ],
};

test("renders a statut history block component", async () => {
  grantAnonymousAccess({ acl: ["page_formation/voir_status_publication_aff"] });

  const { queryByText, getByText } = render(<HistoryBlock formation={formation} />);

  await waitFor(() => getByText("Historique des modifications"));

  const title = queryByText("Historique des modifications");
  expect(title).toBeInTheDocument();
});

test("display update history", async () => {
  grantAnonymousAccess({ acl: ["page_formation/modifier_informations"] });

  const { getByText, queryByText } = render(<HistoryBlock formation={formation} limit={100} />);

  await waitFor(() => getByText(/Historique des modifications/));

  expect(queryByText(new Date(1643875591935).toLocaleDateString("fr-FR"))).toBeInTheDocument();
  expect(queryByText(new Date(1643985528488).toLocaleDateString("fr-FR"))).toBeInTheDocument();
  // expect(queryByText(new Date("2022-04-14T21:45:52.309Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();
  // expect(queryByText(new Date("2022-04-16T21:45:53.118Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();
});
