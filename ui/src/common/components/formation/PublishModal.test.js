import React from "react";
import { render, waitFor } from "@testing-library/react";
import { getPublishRadioValue, getSubmitBody, PublishModal, updateFormationAndReconciliation } from "./PublishModal";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";
import * as api from "../../api/formation";
import userEvent from "@testing-library/user-event";

jest.setTimeout(20000);

test("should return undefined when status is not known or à publier", () => {
  expect(getPublishRadioValue(COMMON_STATUS.A_PUBLIER)).toEqual(undefined);
  expect(getPublishRadioValue("some_status")).toEqual(undefined);
});

test("should return true when status is publie or en attente", () => {
  expect(getPublishRadioValue(COMMON_STATUS.PUBLIE)).toEqual("true");
  expect(getPublishRadioValue(COMMON_STATUS.EN_ATTENTE)).toEqual("true");
});

test("should return false when status is non publie", () => {
  expect(getPublishRadioValue(COMMON_STATUS.NON_PUBLIE)).toEqual("false");
});

test("should compute submit body when publish affelnet", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    affelnet: "true",
    parcoursup: "false",
    affelnet_infos_offre: "test info",
    date: new Date("2021-10-14"),
  });

  expect(result).toEqual({
    body: {
      affelnet_infos_offre: "test info",
      affelnet_raison_depublication: null,
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
      last_statut_update_date: new Date("2021-10-14"),
    },
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should compute submit body when publish affelnet & restore reconciliation", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    affelnet: "true",
    affelnet_infos_offre: "test info",
    date: new Date("2021-10-14"),
  });

  expect(result).toEqual({
    body: {
      affelnet_infos_offre: "test info",
      affelnet_raison_depublication: null,
      affelnet_statut: AFFELNET_STATUS.EN_ATTENTE,
      last_statut_update_date: new Date("2021-10-14"),
    },
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should update info when publish affelnet", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "hello",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    affelnet: "true",
    parcoursup: "false",
    affelnet_infos_offre: "Hello info",
  });

  expect(result).toEqual({
    body: {
      affelnet_infos_offre: "Hello info",
    },
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should do nothing when publish affelnet on unknown status", () => {
  const formation = {
    _id: "id",
    affelnet_statut: "unknown",
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "hello",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    affelnet: "true",
    parcoursup: "false",
    affelnet_infos_offre: "Hello info",
  });

  expect(result).toEqual({
    body: {},
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should compute submit body when UNpublish affelnet", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    affelnet: "false",
    parcoursup: "false",
    affelnet_raison_depublication: "not to be published",
    date: new Date("2021-10-14"),
  });

  expect(result).toEqual({
    body: {
      affelnet_raison_depublication: "not to be published",
      affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
      affelnet_published_date: null,
      last_statut_update_date: new Date("2021-10-14"),
    },
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should do nothing when UNpublish affelnet for a status already not published", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    affelnet: "false",
    affelnet_raison_depublication: "not to be published",
  });

  expect(result).toEqual({
    body: {},
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should compute submit body when publish parcoursup", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    parcoursup: "true",
    date: new Date("2021-10-14"),
  });

  expect(result).toEqual({
    body: {
      parcoursup_raison_depublication: null,
      parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
      last_statut_update_date: new Date("2021-10-14"),
    },
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should compute submit body when publish parcoursup & restore reconciliation", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    parcoursup: "true",
    date: new Date("2021-10-14"),
  });

  expect(result).toEqual({
    body: {
      parcoursup_raison_depublication: null,
      parcoursup_statut: PARCOURSUP_STATUS.EN_ATTENTE,
      last_statut_update_date: new Date("2021-10-14"),
    },
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: true,
  });
});

test("should compute submit body when UNpublish parcoursup", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    parcoursup: "false",
    parcoursup_raison_depublication: "not to be published",
    date: new Date("2021-10-14"),
  });

  expect(result).toEqual({
    body: {
      parcoursup_published_date: null,
      parcoursup_raison_depublication: "not to be published",
      parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
      last_statut_update_date: new Date("2021-10-14"),
    },
    shouldRemovePsReconciliation: true,
    shouldRestorePsReconciliation: false,
  });
});

test("should do nothing when publish parcoursup on unknown status", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: "unknown",
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const result = getSubmitBody({
    formation,
    parcoursup: "true",
  });

  expect(result).toEqual({
    body: {},
    shouldRemovePsReconciliation: false,
    shouldRestorePsReconciliation: false,
  });
});

test("should update formation and reconciliation affelnet", async () => {
  const updateFormation = jest.fn();
  const updateReconciliationParcoursup = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);
  jest.spyOn(api, "updateReconciliationParcoursup").mockImplementation(updateReconciliationParcoursup);

  const onFormationUpdate = jest.fn();
  await updateFormationAndReconciliation({
    body: {},
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();
  expect(updateReconciliationParcoursup).not.toHaveBeenCalled();

  updateFormation.mockClear();
  onFormationUpdate.mockClear();
  updateReconciliationParcoursup.mockClear();

  await updateFormationAndReconciliation({
    body: {},
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();
  expect(updateReconciliationParcoursup).not.toHaveBeenCalled();
});

test("should update formation", async () => {
  const updateFormation = jest.fn();
  const updateReconciliationParcoursup = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);
  jest.spyOn(api, "updateReconciliationParcoursup").mockImplementation(updateReconciliationParcoursup);

  const onFormationUpdate = jest.fn();
  await updateFormationAndReconciliation({
    body: {},
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();
  expect(updateReconciliationParcoursup).not.toHaveBeenCalled();
});

test("should update formation and reconciliation parcoursup", async () => {
  const updateFormation = jest.fn();
  const updateReconciliationParcoursup = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);
  jest.spyOn(api, "updateReconciliationParcoursup").mockImplementation(updateReconciliationParcoursup);

  const onFormationUpdate = jest.fn();
  await updateFormationAndReconciliation({
    body: {},
    shouldRemovePsReconciliation: true,
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();
  expect(updateReconciliationParcoursup).toHaveBeenCalled();

  updateFormation.mockClear();
  onFormationUpdate.mockClear();
  updateReconciliationParcoursup.mockClear();

  await updateFormationAndReconciliation({
    body: {},
    shouldRestorePsReconciliation: true,
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();
  expect(updateReconciliationParcoursup).toHaveBeenCalled();
});

test("should render the publish modal", () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { getByTestId, queryByText } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const psupForm = getByTestId("parcoursup-form");
  expect(psupForm).toHaveAttribute("aria-disabled", "true");

  const afForm = getByTestId("affelnet-form");
  expect(afForm).toHaveAttribute("aria-disabled", "false");

  const afPublishFormLabel = queryByText("Informations offre de formation (facultatif) :");
  expect(afPublishFormLabel).not.toBeVisible();
});

test("should toggle the affelnet forms", async () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    parcoursup_statut: PARCOURSUP_STATUS.HORS_PERIMETRE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { queryByText, getByTestId } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const afPublishFormLabel = queryByText("Informations offre de formation (facultatif) :");
  expect(afPublishFormLabel).not.toBeVisible();

  const afUnPublishForm = getByTestId("af-unpublish-form");
  expect(afUnPublishForm).not.toBeVisible();

  const radioYes = getByTestId("af-radio-yes");
  userEvent.click(radioYes);
  await waitFor(() => expect(afPublishFormLabel).toBeVisible(), { timeout: 10000 });
  expect(afUnPublishForm).not.toBeVisible();

  const radioNo = getByTestId("af-radio-no");
  userEvent.click(radioNo);
  await waitFor(() => expect(afUnPublishForm).toBeVisible(), { timeout: 10000 });
  expect(afPublishFormLabel).not.toBeVisible();
});

test("should toggle the parcoursup forms", async () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { queryByText, getByTestId } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const afPublishFormLabel = queryByText("Informations offre de formation (facultatif) :");
  expect(afPublishFormLabel).not.toBeVisible();

  const psUnPublishForm = getByTestId("ps-unpublish-form");
  expect(psUnPublishForm).not.toBeVisible();

  const radioYes = getByTestId("ps-radio-yes");
  userEvent.click(radioYes);
  expect(afPublishFormLabel).not.toBeVisible();
  expect(psUnPublishForm).not.toBeVisible();

  const radioNo = getByTestId("ps-radio-no");
  userEvent.click(radioNo);
  await waitFor(() => expect(psUnPublishForm).toBeVisible(), { timeout: 10000 });
  expect(afPublishFormLabel).not.toBeVisible();
});

test("should submit", async () => {
  const updateFormation = jest.fn();
  const updateReconciliationParcoursup = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);
  jest.spyOn(api, "updateReconciliationParcoursup").mockImplementation(updateReconciliationParcoursup);

  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { queryByText, getByTestId } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const radioYes = getByTestId("ps-radio-yes");
  userEvent.click(radioYes);

  const submitBtn = queryByText("Enregistrer les modifications");
  expect(submitBtn).toBeInTheDocument();
  userEvent.click(submitBtn);

  await waitFor(() => expect(onClose).toBeCalled());
  expect(onFormationUpdate).toHaveBeenCalled();
});

test("should submit but no update", async () => {
  const updateFormation = jest.fn();
  const updateReconciliationParcoursup = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);
  jest.spyOn(api, "updateReconciliationParcoursup").mockImplementation(updateReconciliationParcoursup);

  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { queryByText } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const submitBtn = queryByText("Enregistrer les modifications");
  expect(submitBtn).toBeInTheDocument();
  userEvent.click(submitBtn);

  await waitFor(() => expect(onClose).toBeCalled());
  expect(onFormationUpdate).not.toHaveBeenCalled();
});

test("should close", async () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.HORS_PERIMETRE,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "test_uai_formation",
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { queryByText } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const submitBtn = queryByText("Annuler");
  expect(submitBtn).toBeInTheDocument();
  userEvent.click(submitBtn);
  await waitFor(() => expect(onClose).toBeCalled());
});
