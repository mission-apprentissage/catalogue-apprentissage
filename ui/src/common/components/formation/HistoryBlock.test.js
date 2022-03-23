import React from "react";
import { render } from "@testing-library/react";
import { grantAnonymousAccess } from "../../utils/testUtils";
import { waitFor } from "@testing-library/react";
import { HistoryBlock } from "./HistoryBlock";

const formation = {
  parcoursup_statut: "en attente de publication",
  parcoursup_statut_history: [
    {
      parcoursup_statut: "à publier",
      date: "2021-07-19T02:11:01.285Z",
    },
    {
      parcoursup_statut: "à publier",
      date: "2021-09-17T10:48:00.753Z",
    },
    {
      parcoursup_statut: "à publier",
      date: "2021-09-25T00:02:58.875Z",
    },
    {
      parcoursup_statut: "à publier",
      date: "2021-09-26T00:49:31.693Z",
    },
    {
      parcoursup_statut: "hors périmètre",
      date: "2021-09-27T00:56:33.397Z",
    },
    {
      parcoursup_statut: "hors périmètre",
      date: "2021-09-28T00:32:33.364Z",
    },
    {
      parcoursup_statut: "hors périmètre",
      date: "2021-10-14T00:28:18.624Z",
    },
    {
      parcoursup_statut: "hors périmètre",
      date: "2021-12-07T04:43:01.496Z",
    },
    {
      parcoursup_statut: "hors périmètre",
      date: "2021-12-08T02:12:24.372Z",
    },
    {
      parcoursup_statut: "hors périmètre",
      date: "2021-12-09T04:12:39.572Z",
    },
    {
      parcoursup_statut: "à publier",
      date: "2021-12-10T04:19:37.114Z",
    },

    {
      parcoursup_statut: "à publier",
      date: "2022-01-13T05:27:26.977Z",
    },

    {
      parcoursup_statut: "à publier",
      date: "2022-01-22T05:28:35.079Z",
    },
    {
      parcoursup_statut: "à publier",
      date: "2022-01-23T05:30:23.779Z",
    },
    {
      parcoursup_statut: "en attente de publication",
      date: "2022-01-24T05:17:57.784Z",
    },
    {
      parcoursup_statut: "en attente de publication",
      date: "2022-01-25T05:19:17.064Z",
    },
    {
      parcoursup_statut: "en attente de publication",
      date: "2022-01-28T05:24:27.713Z",
    },
    {
      parcoursup_statut: "en attente de publication",
      date: "2022-03-05T05:45:32.823Z",
    },
    {
      parcoursup_statut: "en attente de publication",
      date: "2022-03-06T06:02:25.304Z",
    },
  ],
  affelnet_statut: "hors périmètre",
  affelnet_statut_history: [
    {
      affelnet_statut: "hors périmètre",
      date: "2021-06-12T02:16:15.664Z",
    },
    {
      affelnet_statut: "hors périmètre",
      date: "2021-06-15T02:21:31.163Z",
    },

    {
      affelnet_statut: "hors périmètre",
      date: "2021-12-27T07:48:50.236Z",
    },
    {
      affelnet_statut: "hors périmètre",
      date: "2021-12-28T03:42:59.871Z",
    },
    {
      affelnet_statut: "à publier",
      date: "2021-12-29T03:39:55.777Z",
    },
    {
      affelnet_statut: "à publier",
      date: "2021-12-30T05:59:22.716Z",
    },
    {
      affelnet_statut: "à publier",
      date: "2022-01-30T05:47:34.173Z",
    },
    {
      affelnet_statut: "à publier",
      date: "2022-01-31T05:44:01.116Z",
    },
    {
      affelnet_statut: "hors périmètre",
      date: "2022-01-31T09:46:33.274Z",
    },
    {
      affelnet_statut: "hors périmètre",
      date: "2022-02-01T05:43:53.308Z",
    },
    {
      affelnet_statut: "hors périmètre",
      date: "2022-03-05T05:52:22.501Z",
    },
    {
      affelnet_statut: "hors périmètre",
      date: "2022-03-06T06:09:31.668Z",
    },
  ],
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
  ],
};

test("renders a statut history block component", async () => {
  grantAnonymousAccess({ acl: ["page_formation/voir_status_publication_aff"] });

  const { queryByText, getByText } = render(<HistoryBlock formation={formation} />);

  await waitFor(() => getByText("Historique des modifications"));

  const title = queryByText("Historique des modifications");
  expect(title).toBeInTheDocument();
});

test("display affelnet statut history", async () => {
  grantAnonymousAccess({ acl: ["page_formation/voir_status_publication_aff"] });

  const { getByText, queryByText } = render(<HistoryBlock formation={formation} />);

  await waitFor(() => getByText(/Historique des modifications/));

  expect(queryByText(new Date("2022-01-31T09:46:33.274Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();
  expect(queryByText(new Date("2021-12-29T03:39:55.777Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();
  expect(queryByText(new Date("2021-06-12T02:16:15.664Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();

  expect(queryByText(new Date("2022-03-05T05:52:22.501Z").toLocaleDateString("fr-FR"))).not.toBeInTheDocument();
});

test("display parcoursup statut history", async () => {
  grantAnonymousAccess({ acl: ["page_formation/voir_status_publication_ps"] });

  const { getByText, queryByText } = render(<HistoryBlock formation={formation} />);

  await waitFor(() => getByText(/Historique des modifications/));

  expect(queryByText(new Date("2022-01-24T05:17:57.784Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();
  expect(queryByText(new Date("2021-12-10T04:19:37.114Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();
  expect(queryByText(new Date("2021-09-27T00:56:33.397Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();
  expect(queryByText(new Date("2021-07-19T02:11:01.285Z").toLocaleDateString("fr-FR"))).toBeInTheDocument();

  expect(queryByText(new Date("2022-03-05T05:52:22.501Z").toLocaleDateString("fr-FR"))).not.toBeInTheDocument();
});

test("display update history", async () => {
  grantAnonymousAccess({ acl: ["page_formation/gestion_publication", "page_formation/modifier_informations"] });

  const { getByText, queryByText } = render(<HistoryBlock formation={formation} />);

  await waitFor(() => getByText(/Historique des modifications/));

  expect(queryByText(new Date(1643875591935).toLocaleDateString("fr-FR"))).toBeInTheDocument();
  expect(queryByText(new Date(1643985528488).toLocaleDateString("fr-FR"))).toBeInTheDocument();
});
