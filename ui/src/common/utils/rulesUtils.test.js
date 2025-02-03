import { isStatusChangeEnabled } from "./rulesUtils";
import { AFFELNET_STATUS, PARCOURSUP_STATUS } from "../../constants/status";
import { CONDITIONS } from "../../constants/conditionsIntegration";
import { PLATEFORME } from "../../constants/plateforme";

test("status change should be enabled on national for parcoursup", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.PARCOURSUP,
    academie: null,
    num_academie: null,
    status: PARCOURSUP_STATUS.A_PUBLIER,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeTruthy();
});

test("status change should be enabled on academy for parcoursup 'à publier soumis à validation du recteur'", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.PARCOURSUP,
    academie: "1",
    num_academie: null,
    status: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeTruthy();
});

test("status change should be enabled on academy for parcoursup 'à publier soumis à validation du recteur' for an academic rule", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.PARCOURSUP,
    academie: "1",
    num_academie: 1,
    status: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeTruthy();
});

test("status change should not be enabled on academy for parcoursup 'à publier soumis à validation du recteur' for an academic rule on different academy", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.PARCOURSUP,
    academie: "1",
    num_academie: 2,
    status: PARCOURSUP_STATUS.A_PUBLIER_VALIDATION_RECTEUR,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeFalsy();
});

test("status change should not be enabled on academy for parcoursup other status", () => {
  let result = isStatusChangeEnabled({
    plateforme: PLATEFORME.PARCOURSUP,
    academie: "1",
    num_academie: null,
    status: PARCOURSUP_STATUS.A_PUBLIER,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeFalsy();

  result = isStatusChangeEnabled({
    plateforme: PLATEFORME.PARCOURSUP,
    academie: "1",
    num_academie: null,
    status: PARCOURSUP_STATUS.A_PUBLIER_VERIFIER_POSTBAC,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeFalsy();
});

test("status change should be enabled on national for affelnet", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.AFFELNET,
    academie: null,
    num_academie: null,
    status: AFFELNET_STATUS.A_PUBLIER,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeTruthy();
});

test("status change should be enabled on academy for affelnet 'peut intégrer'", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.AFFELNET,
    academie: "1",
    num_academie: null,
    status: AFFELNET_STATUS.A_PUBLIER,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeTruthy();
});

test("status change should be enabled on academy for affelnet 'peut intégrer' for an academic rule on same academy", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.AFFELNET,
    academie: "1",
    num_academie: 1,
    status: AFFELNET_STATUS.A_PUBLIER,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeTruthy();
});

test("status change should not be enabled on academy for affelnet 'peut intégrer' for an academic rule on different academy", () => {
  const result = isStatusChangeEnabled({
    plateforme: PLATEFORME.AFFELNET,
    academie: "1",
    num_academie: 2,
    status: AFFELNET_STATUS.A_PUBLIER,
    condition_integration: CONDITIONS.PEUT_INTEGRER,
  });

  expect(result).toBeFalsy();
});

test("status change should be not enabled on academy for affelnet consition other than 'peut intégrer'", () => {
  let result = isStatusChangeEnabled({
    plateforme: PLATEFORME.AFFELNET,
    academie: "1",
    num_academie: null,
    status: AFFELNET_STATUS.A_PUBLIER,
    condition_integration: CONDITIONS.DOIT_INTEGRER,
  });

  expect(result).toBeFalsy();

  result = isStatusChangeEnabled({
    plateforme: PLATEFORME.AFFELNET,
    academie: "1",
    num_academie: null,
    status: AFFELNET_STATUS.A_PUBLIER_VALIDATION,
    condition_integration: CONDITIONS.NE_DOIT_PAS_INTEGRER,
  });

  expect(result).toBeFalsy();
});
