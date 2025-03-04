import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getPublishRadioValue, getSubmitBody, PublishModal, updateFormationWithCallback } from "./PublishModal";
import { AFFELNET_STATUS, COMMON_STATUS, PARCOURSUP_STATUS } from "../../../constants/status";
import * as api from "../../api/formation";

jest.setTimeout(20000);

it("should return undefined when status is not known or à publier", () => {
  expect(getPublishRadioValue(COMMON_STATUS.A_PUBLIER)).toEqual(undefined);
  expect(getPublishRadioValue("some_status")).toEqual(undefined);
});

it("should return true when status is publie or en attente", () => {
  expect(getPublishRadioValue(COMMON_STATUS.PUBLIE)).toEqual("true");
  expect(getPublishRadioValue(COMMON_STATUS.PRET_POUR_INTEGRATION)).toEqual("true");
});

it("should return false when status is non publie", () => {
  expect(getPublishRadioValue(COMMON_STATUS.NON_PUBLIE)).toEqual("false");
});

it("should compute submit body when publish affelnet", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
      affelnet_statut: AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      last_statut_update_date: new Date("2021-10-14"),
    },
  });
});

it("should compute submit body when publish affelnet ", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
      affelnet_statut: AFFELNET_STATUS.PRET_POUR_INTEGRATION,
      last_statut_update_date: new Date("2021-10-14"),
    },
  });
});

it("should update info when publish affelnet", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "hello",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
  });
});

it("should do nothing when publish affelnet on unknown status", () => {
  const formation = {
    _id: "id",
    affelnet_statut: "unknown",
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "hello",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
  });
});

it("should compute submit body when UNpublish affelnet", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
  });
});

it("should do nothing when UNpublish affelnet for a status already not published", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIE,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
  });
});

it("should compute submit body when publish parcoursup", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
      parcoursup_error: null,
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      last_statut_update_date: new Date("2021-10-14"),
      rejection: null,
    },
  });
});

it("should compute submit body when publish parcoursup", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
      parcoursup_error: null,
      parcoursup_statut: PARCOURSUP_STATUS.PRET_POUR_INTEGRATION,
      rejection: null,
      last_statut_update_date: new Date("2021-10-14"),
    },
  });
});

it("should compute submit body when UNpublish parcoursup", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: PARCOURSUP_STATUS.PUBLIE,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
  });
});

it("should do nothing when publish parcoursup on unknown status", () => {
  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: "unknown",
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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
  });
});

it("should update formation", async () => {
  const updateFormation = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);

  const onFormationUpdate = jest.fn();
  await updateFormationWithCallback({
    body: {},
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();

  updateFormation.mockClear();
  onFormationUpdate.mockClear();

  await updateFormationWithCallback({
    body: {},
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();
});

it("should update formation", async () => {
  const updateFormation = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);

  const onFormationUpdate = jest.fn();
  await updateFormationWithCallback({
    body: {},
    formation: {},
    user: {},
    onFormationUpdate,
  });

  expect(updateFormation).toHaveBeenCalled();
  expect(onFormationUpdate).toHaveBeenCalled();
});

it("should render the publish modal", () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { getByTestId } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const psupForm = getByTestId("parcoursup-form");
  expect(psupForm).toHaveAttribute("aria-disabled", "true");

  const afForm = getByTestId("affelnet-form");
  expect(afForm).toHaveAttribute("aria-disabled", "false");

  const afPublishForm = getByTestId("af-publish-form");
  expect(afPublishForm).not.toBeVisible();
  expect(afPublishForm).not.toBeVisible();
});

it("should toggle the affelnet forms", async () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.A_PUBLIER,
    parcoursup_statut: PARCOURSUP_STATUS.NON_PUBLIABLE_EN_LETAT,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { getByTestId } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const afPublishForm = getByTestId("af-publish-form");
  expect(afPublishForm).not.toBeVisible();
  expect(afPublishForm).not.toBeVisible();

  const afUnPublishForm = getByTestId("af-unpublish-form");
  expect(afUnPublishForm).not.toBeVisible();

  const radioYes = getByTestId("af-radio-yes");

  await userEvent.click(radioYes);

  await waitFor(() => expect(afPublishForm).toBeVisible(), { timeout: 10000 });
  expect(afUnPublishForm).not.toBeVisible();

  const radioNo = getByTestId("af-radio-no");

  await userEvent.click(radioNo);

  await waitFor(() => expect(afUnPublishForm).toBeVisible(), { timeout: 10000 });
  expect(afPublishForm).not.toBeVisible();
});

it("should toggle the parcoursup forms", async () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { getByTestId } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const afPublishForm = getByTestId("af-publish-form");
  const afUnpublishForm = getByTestId("af-unpublish-form");
  const psPublishForm = getByTestId("ps-publish-form");
  const psUnpublishForm = getByTestId("ps-unpublish-form");

  expect(afPublishForm).not.toBeVisible();
  expect(afUnpublishForm).not.toBeVisible();
  expect(psPublishForm).not.toBeVisible();
  expect(psUnpublishForm).not.toBeVisible();

  const radioYes = getByTestId("ps-radio-yes");

  await userEvent.click(radioYes);

  expect(afPublishForm).not.toBeVisible();
  expect(afUnpublishForm).not.toBeVisible();
  expect(psPublishForm).toBeVisible();
  expect(psUnpublishForm).not.toBeVisible();

  const radioNo = getByTestId("ps-radio-no");

  await userEvent.click(radioNo);

  expect(psUnpublishForm).toBeVisible();
  expect(psPublishForm).not.toBeVisible();
  expect(afPublishForm).not.toBeVisible();
  expect(afUnpublishForm).not.toBeVisible();
});

it("should submit", async () => {
  const updateFormation = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);

  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
    etablissement_gestionnaire_uai: "test_uai_gestionnaire",
    etablissement_formateur_uai: "test_uai_formateur",
    cfd: "test_cfd",
    intitule_long: "PATISSIER CAP",
  };

  const { queryByText, getByTestId } = render(
    <PublishModal isOpen={true} onClose={onClose} onFormationUpdate={onFormationUpdate} formation={formation} />
  );

  const radioYes = getByTestId("ps-radio-yes");

  await userEvent.click(radioYes);

  const submitBtn = queryByText("Enregistrer les modifications");
  expect(submitBtn).toBeInTheDocument();

  await userEvent.click(submitBtn);

  await waitFor(() => expect(onClose).toBeCalled());
  expect(onFormationUpdate).toHaveBeenCalled();
});

it("should submit but no update", async () => {
  const updateFormation = jest.fn();

  jest.spyOn(api, "updateFormation").mockImplementation(updateFormation);

  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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

  await userEvent.click(submitBtn);

  await waitFor(() => expect(onClose).toBeCalled());
  expect(onFormationUpdate).not.toHaveBeenCalled();
});

it("should close", async () => {
  const onClose = jest.fn();
  const onFormationUpdate = jest.fn();

  const formation = {
    _id: "id",
    affelnet_statut: AFFELNET_STATUS.NON_PUBLIABLE_EN_LETAT,
    parcoursup_statut: PARCOURSUP_STATUS.A_PUBLIER,
    affelnet_infos_offre: "",
    affelnet_raison_depublication: "",
    parcoursup_raison_depublication: "",
    num_academie: 10,
    uai_formation: "abcdefg0",
    uai_formation_valide: true,
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

  await userEvent.click(submitBtn);

  await waitFor(() => expect(onClose).toBeCalled());
});
