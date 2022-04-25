import React from "react";
import { rest } from "msw";
import { waitFor } from "@testing-library/react";

import { renderWithRouter, setupMswServer } from "../common/utils/testUtils";
import ReportPage from "./ReportPage";
import { _get } from "../common/httpClient";

const commonImportData = {
  type: "rcoImport",
  uuid: "42",
  date: "2022-04-07T05:00:25.651Z",
};

const commonImportSummary = {
  summary: {
    formationsJCount: 50000,
    addedCount: 5,
    updatedCount: 3,
    deletedCount: 1,
    publishedCount: 50000,
    deactivatedCount: 10,
  },
};

const importReportAdded = {
  ...commonImportData,
  data: {
    ...commonImportSummary,
    added: [{ rcoId: "1" }, { rcoId: "2" }, { rcoId: "3" }, { rcoId: "4" }, { rcoId: "5" }],
  },
};

const importReportUpdated = {
  ...commonImportData,
  data: {
    ...commonImportSummary,
    updated: [{ rcoId: "6" }, { rcoId: "7" }, { rcoId: "8" }],
  },
};

const importReportDeleted = {
  ...commonImportData,
  data: {
    ...commonImportSummary,
    deleted: [{ rcoId: "9" }],
  },
};

const server = setupMswServer(
  rest.get(/\/api\/entity\/reports/, (req, res, ctx) => {
    return res(ctx.json([importReportAdded, importReportUpdated, importReportDeleted]));
  }),
  rest.get(/\/api\/v1\/entity\/alert/, (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("", () => {
  describe("Error cases, mute warns", () => {
    let tmpConsoleWarn = console.warn;
    beforeAll(() => {
      console.warn = jest.fn();
    });
    afterAll(() => {
      console.warn = tmpConsoleWarn;
    });

    it("renders a report page with error", async () => {
      const { queryByText, getByText } = renderWithRouter(<ReportPage />);

      await waitFor(() => getByText("Erreur lors du chargement des données"));

      const error = queryByText("Erreur lors du chargement des données");
      expect(error).toBeInTheDocument();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  it("should mock api /reports ", async () => {
    const response = await _get("/api/entity/reports");
    expect(response).toEqual([importReportAdded, importReportUpdated, importReportDeleted]);
  });

  it("renders a report page with rcoImport report", async () => {
    const { queryAllByText, getAllByText } = renderWithRouter(<ReportPage />, {
      route: `/report?type=rcoImport&date=${Date.now()}&id=42`,
    });

    await waitFor(() => getAllByText("5 Formation(s) ajoutée(s)"));

    const title = queryAllByText("Rapport d'importation catalogue RCO");
    expect(title).toHaveLength(2);

    const addedText = queryAllByText("5 Formation(s) ajoutée(s)");
    expect(addedText).toHaveLength(2);

    const updatedText = queryAllByText("3 Formation(s) mise(s) à jour");
    expect(updatedText).toHaveLength(2);

    const deletedText = queryAllByText("1 Formation(s) supprimée(s)");
    expect(deletedText).toHaveLength(2);
  });
});
