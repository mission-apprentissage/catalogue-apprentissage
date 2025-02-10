import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Line } from "./Line";
import { getCount } from "../../../common/api/perimetre";
import * as api from "../../../common/api/perimetre";
import { AFFELNET_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";
import { CONDITIONS } from "../../../constants/conditionsIntegration";
import { PLATEFORME } from "../../../constants/plateforme";

it("renders line & create rule", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const { queryByText, getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.PARCOURSUP}
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

  await userEvent.selectOptions(actionsSelect, [CONDITIONS.PEUT_INTEGRER]);

  expect(onCreateRule).toHaveBeenCalledWith({
    condition_integration: "peut intégrer",
    diplome: "BTS",
    niveau: "5 (BTS, DEUST...)",
    plateforme: PLATEFORME.PARCOURSUP,
    regle_complementaire: "{}",
    statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
});

it("renders Line & shows rule", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: AFFELNET_STATUS.A_DEFINIR,
    _id: "345",
    nom_regle_complementaire: "BTS Agri",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    annee: 1,
    duree: 1,
  };

  const { queryByText, getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.AFFELNET}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      rule={rule}
    />
  );

  const label = queryByText("My test line");
  expect(label).toBeInTheDocument();

  const actionsSelect = getByTestId("actions-select");
  expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

  const statusSelect = getByTestId("status-select");
  expect(statusSelect).toHaveAttribute("aria-disabled", "false");

  expect(getCount).toHaveBeenCalledWith({
    diplome: "BTS",
    niveau: "5 (BTS, DEUST...)",
    regle_complementaire: "{}",
    plateforme: PLATEFORME.AFFELNET,
    annee: 1,
    duree: 1,
  });

  await waitFor(() => expect(queryByText("123")).toBeInTheDocument());

  const line = getByTestId("line");

  await userEvent.click(line);

  expect(onShowRule).toHaveBeenCalledWith(rule);
});

it("renders Line for academie & doesn't show rule", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: AFFELNET_STATUS.A_DEFINIR,
    _id: "345",
    nom_regle_complementaire: "BTS Agri",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    annee: 1,
    duree: 1,
  };

  const { queryByText, getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.AFFELNET}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      rule={rule}
      academie={"14"}
    />
  );

  const label = queryByText("My test line");
  expect(label).toBeInTheDocument();

  const statusSelect = getByTestId("status-select");
  expect(statusSelect).toHaveAttribute("aria-disabled", "false");

  expect(getCount).toHaveBeenCalledWith({
    academie: "14",
    diplome: "BTS",
    niveau: "5 (BTS, DEUST...)",
    regle_complementaire: "{}",
    plateforme: PLATEFORME.AFFELNET,
    annee: 1,
    duree: 1,
  });

  await waitFor(() => expect(queryByText("123")).toBeInTheDocument());

  const line = getByTestId("line");

  await userEvent.click(line);

  expect(onShowRule).not.toHaveBeenCalledWith(rule);
});

it("Action select - should delete rule", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
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
      plateforme={PLATEFORME.PARCOURSUP}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      onDeleteRule={onDeleteRule}
      rule={rule}
    />
  );

  const actionsSelect = getByTestId("actions-select");
  expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

  await userEvent.selectOptions(actionsSelect, [CONDITIONS.NE_DOIT_PAS_INTEGRER]);

  expect(onDeleteRule).toHaveBeenCalledWith({
    _id: "345",
  });
});

it(`Action select - should update rule & set "non publiable en l'état"`, async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
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

  const { getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.PARCOURSUP}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      rule={rule}
    />
  );

  const actionsSelect = getByTestId("actions-select");
  expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

  await userEvent.selectOptions(actionsSelect, [CONDITIONS.NE_DOIT_PAS_INTEGRER]);

  expect(onUpdateRule).toHaveBeenCalledWith({
    _id: "345",
    condition_integration: "ne doit pas intégrer",
    statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
  });
});

it("Action select - should update rule & set à publier", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.A_PUBLIER,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.NE_DOIT_PAS_INTEGRER,
    statut_academies: {},
    nom_regle_complementaire: "BTS Agri",
  };

  const { getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.PARCOURSUP}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      rule={rule}
    />
  );

  const actionsSelect = getByTestId("actions-select");
  expect(actionsSelect).toHaveAttribute("aria-disabled", "false");

  await userEvent.selectOptions(actionsSelect, [CONDITIONS.PEUT_INTEGRER]);

  expect(onUpdateRule).toHaveBeenCalledWith({
    _id: "345",
    condition_integration: "peut intégrer",
    statut: PARCOURSUP_STATUS.A_PUBLIER_HABILITATION,
  });
});

it("Status select - should update status", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    nom_regle_complementaire: "BTS Agri",
  };

  const { getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.PARCOURSUP}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      rule={rule}
    />
  );

  const statusSelect = getByTestId("status-select");
  expect(statusSelect).toHaveAttribute("aria-disabled", "false");

  await userEvent.selectOptions(statusSelect, [PARCOURSUP_STATUS.A_PUBLIER]);

  expect(onUpdateRule).toHaveBeenCalledWith({
    _id: "345",
    statut: PARCOURSUP_STATUS.A_PUBLIER,
  });
});

it("Status select - should update status for academie", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: AFFELNET_STATUS.A_DEFINIR,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: {},
    nom_regle_complementaire: "BTS Agri",
  };

  const { getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.AFFELNET}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      rule={rule}
      academie={"14"}
    />
  );

  const statusSelect = getByTestId("status-select");
  expect(statusSelect).toHaveAttribute("aria-disabled", "false");

  await userEvent.selectOptions(statusSelect, [AFFELNET_STATUS.A_PUBLIER]);

  expect(onUpdateStatutAcademieRule).toHaveBeenCalledWith({
    _id: "345",
    num_academie: "14",
    statut: AFFELNET_STATUS.A_PUBLIER,
  });

  expect(onDeleteStatutAcademieRule).not.toHaveBeenCalled();
});

it("Status select - should remove status for academie", async () => {
  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onUpdateStatutAcademieRule = jest.fn();
  const onDeleteStatutAcademieRule = jest.fn();
  const onDeleteRule = jest.fn();

  const rule = {
    statut: AFFELNET_STATUS.A_DEFINIR,
    _id: "345",
    regle_complementaire: "{}",
    condition_integration: CONDITIONS.PEUT_INTEGRER,
    statut_academies: { 14: AFFELNET_STATUS.A_PUBLIER },
    nom_regle_complementaire: "BTS Agri",
  };

  const { getByTestId } = render(
    <Line
      showIcon={false}
      plateforme={PLATEFORME.AFFELNET}
      niveau={"5 (BTS, DEUST...)"}
      label={"My test line"}
      shouldFetchCount={true}
      diplome={"BTS"}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      onUpdateStatutAcademieRule={onUpdateStatutAcademieRule}
      onDeleteStatutAcademieRule={onDeleteStatutAcademieRule}
      rule={rule}
      academie={"14"}
    />
  );

  const statusSelect = getByTestId("status-select");
  expect(statusSelect).toHaveAttribute("aria-disabled", "false");

  await userEvent.selectOptions(statusSelect, [AFFELNET_STATUS.A_DEFINIR]);

  expect(onUpdateStatutAcademieRule).not.toHaveBeenCalled();

  // TO FIX
  // expect(onDeleteStatutAcademieRule).toHaveBeenCalledWith({
  //   _id: "345",
  //   num_academie: "14",
  // });
});
