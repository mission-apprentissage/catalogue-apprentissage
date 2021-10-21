import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Diplome } from "./Diplome";
import * as api from "../../../common/api/perimetre";
import { getCount } from "../../../common/api/perimetre";
import { act } from "react-dom/test-utils";

test("renders Diplome & sub rules", async () => {
  const scrollIntoView = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

  jest.spyOn(api, "getCount").mockImplementation(() => 123);

  const onShowRule = jest.fn();
  const onCreateRule = jest.fn();
  const onUpdateRule = jest.fn();
  const onDeleteRule = jest.fn();

  const diplome = {
    value: "BTS",
    count: 300,
    regles: [{ nom_regle_complementaire: null }, { nom_regle_complementaire: "test rule", _id: 1234 }],
  };

  const { queryByText, getAllByTestId } = render(
    <Diplome
      plateforme={"parcoursup"}
      niveau={"5 (BTS, DEUST...)"}
      diplome={diplome}
      onShowRule={onShowRule}
      onCreateRule={onCreateRule}
      onUpdateRule={onUpdateRule}
      onDeleteRule={onDeleteRule}
      isExpanded={true}
      isSelected={true}
    />
  );

  await waitFor(() => expect(queryByText("123")).toBeInTheDocument());

  expect(scrollIntoView).toHaveBeenCalled();

  const labelDiplome = queryByText("BTS");
  expect(labelDiplome).toBeInTheDocument();

  const labelRule = queryByText("test rule");
  expect(labelRule).toBeInTheDocument();

  const lineNodes = getAllByTestId("line");
  expect(lineNodes).toHaveLength(2);
});
