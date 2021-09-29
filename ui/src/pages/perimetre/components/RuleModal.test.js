import { getDiplomesAllowedForSubRulesUrl } from "./RuleModal";

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
