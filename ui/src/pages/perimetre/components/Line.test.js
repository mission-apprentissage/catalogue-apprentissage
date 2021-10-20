import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Line } from "./Line";
import { getCount } from "../../../common/api/perimetre";
import * as api from "../../../common/api/perimetre";
import { PARCOURSUP_STATUS } from "../../../constants/status";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

test("renders line & create rule", () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const { queryByText, getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={"parcoursup"}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
    />
  );

  const label = queryByText("My test line");
  expect(label).toBeInTheDocument();

  const actionsSelect = getByTestId("actions-select");
  expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

  const statusSelect = getByTestId("status-select");
  expect(statusSelect).toHaveAttribute("aria-disabled", "false");

  expect(getCount).not.toHaveBeenCalled();
  expect(queryByText("123")).not.toBeInTheDocument();

  userEvent.selectOptions(actionsSelect, [CONDITIONS.PEUT_INTEGRER]);
  expect(onCreateRule).toHaveBeenCalledWith({
    condition_integration: "peut intégrer",
    diplome: "BTS",
    niveau: "5 (BTS, DEUST...)",
    plateforme: "parcoursup",
    regle_complementaire: "{}",
    statut: "à publier",
  });
});

test("renders Line for academie & show rule", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    _id: "345",
    nom_regle_complementaire: "BTS Agri",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    num_academie: 14,
  };

  const { queryByText, getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={"parcoursup"}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      rule={rule}
      academie={"14"}
    />
  );

  const label = queryByText("Rennes (14) - My test line");
  expect(label).toBeInTheDocument();

  const actionsSelect = getByTestId("actions-select");
  expect(actionsSelect).toHaveAttribute("aria-disabled", "true");

  const statusSelect = getByTestId("status-select");
  expect(statusSelect).toHaveAttribute("aria-disabled", "true");

  expect(getCount).toHaveBeenCalledWith({
    academie: "14",
    diplome: "BTS",
    niveau: "5 (BTS, DEUST...)",
    regle_complementaire: "{}",
  });

  await waitFor(() => expect(queryByText("123")).toBeInTheDocument());

  const line = getByTestId("line");
  userEvent.click(line);

  expect(onShowRule).toHaveBeenCalledWith(rule);
});

test("Action select - should delete rule", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    num_academie: 14,
  };

  const { getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={"parcoursup"}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      rule={rule}
    />
  );

  const actionsSelect = getByTestId("actions-select");
  expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

  userEvent.selectOptions(actionsSelect, [CONDITIONS.NE_DOIT_PAS_INTEGRER]);
  expect(onDeleteRule).toHaveBeenCalledWith({
    _id: "345",
  });
});

test("Action select - should update rule & set hors périmètre", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    num_academie: 14,
    nom_regle_complementaire: "BTS Agri",
  };

  await act(async () => {
    const { getByTestId } = render(
      <Line
        showIcon={false}
        plateforme={"parcoursup"}
        niveau={"5 (BTS, DEUST...)"}
        label={"My test line"}
        shouldFetchCount={true}
        diplome={"BTS"}
        onShowRule={onShowRule}
        onCreateRule={onCreateRule}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        rule={rule}
      />
    );

    const actionsSelect = getByTestId("actions-select");
    expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

    userEvent.selectOptions(actionsSelect, [CONDITIONS.NE_DOIT_PAS_INTEGRER]);
    expect(onUpdateRule).toHaveBeenCalledWith({
      _id: "345",
      condition_integration: "ne doit pas intégrer",
      statut: "hors périmètre",
    });
  });
});

test("Action select - should update rule & set à publier", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.NE_DOIT_PAS_INTEGRER,
    statut_academies: {},
    num_academie: 14,
    nom_regle_complementaire: "BTS Agri",
  };

  await act(async () => {
    const { getByTestId } = render(
      <Line
        showIcon={false}
        plateforme={"parcoursup"}
        niveau={"5 (BTS, DEUST...)"}
        label={"My test line"}
        shouldFetchCount={true}
        diplome={"BTS"}
        onShowRule={onShowRule}
        onCreateRule={onCreateRule}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        rule={rule}
      />
    );

    const actionsSelect = getByTestId("actions-select");
    expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

    userEvent.selectOptions(actionsSelect, [CONDITIONS.PEUT_INTEGRER]);
    expect(onUpdateRule).toHaveBeenCalledWith({
      _id: "345",
      condition_integration: "peut intégrer",
      statut: "à publier",
    });
  });
});

test("Status select - should update status", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    num_academie: 14,
    nom_regle_complementaire: "BTS Agri",
  };

  await act(async () => {
    const { getByTestId } = render(
      <Line
        showIcon={false}
        plateforme={"parcoursup"}
        niveau={"5 (BTS, DEUST...)"}
        label={"My test line"}
        shouldFetchCount={true}
        diplome={"BTS"}
        onShowRule={onShowRule}
        onCreateRule={onCreateRule}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        rule={rule}
      />
    );

    const statusSelect = getByTestId("status-select");
    expect(statusSelect).toHaveAttribute("aria-disabled", "false");

    userEvent.selectOptions(statusSelect, [PARCOURSUP_STATUS.A_PUBLIER]);
    expect(onUpdateRule).toHaveBeenCalledWith({
      _id: "345",
      statut: "à publier",
    });
  });
});

test("Status select - should update status for academie", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    num_academie: 14,
    nom_regle_complementaire: "BTS Agri",
  };

  await act(async () => {
    const { getByTestId } = render(
      <Line
        showIcon={false}
        plateforme={"parcoursup"}
        niveau={"5 (BTS, DEUST...)"}
        label={"My test line"}
        shouldFetchCount={true}
        diplome={"BTS"}
        onShowRule={onShowRule}
        onCreateRule={onCreateRule}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        rule={rule}
        academie={"14"}
      />
    );

    const statusSelect = getByTestId("status-select");
    expect(statusSelect).toHaveAttribute("aria-disabled", "false");

    userEvent.selectOptions(statusSelect, [PARCOURSUP_STATUS.A_PUBLIER]);
    expect(onUpdateRule).toHaveBeenCalledWith({
      _id: "345",
      statut_academies: {
        "14": "à publier",
      },
    });
  });
});

test("Status select - should remove status for academie", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: { "14": "à publier" },
    num_academie: 14,
    nom_regle_complementaire: "BTS Agri",
  };

  await act(async () => {
    const { getByTestId } = render(
      <Line
        showIcon={true}
        plateforme={"parcoursup"}
        niveau={"5 (BTS, DEUST...)"}
        label={"My test line"}
        shouldFetchCount={true}
        diplome={"BTS"}
        onShowRule={onShowRule}
        onCreateRule={onCreateRule}
        onUpdateRule={onUpdateRule}
        onDeleteRule={onDeleteRule}
        rule={rule}
        academie={"14"}
      />
    );

    const statusSelect = getByTestId("status-select");
    expect(statusSelect).toHaveAttribute("aria-disabled", "false");

    userEvent.selectOptions(statusSelect, [PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR]);
    expect(onUpdateRule).toHaveBeenCalledWith({
      _id: "345",
      statut_academies: {},
    });
  });
});
