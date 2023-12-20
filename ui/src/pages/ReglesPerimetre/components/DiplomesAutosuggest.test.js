import React from "react";
import { render, waitFor } from "@testing-library/react";
import { DiplomesAutosuggest } from "./DiplomesAutosuggest";
import * as api from "../../../common/api/perimetre";
import userEvent from "@testing-library/user-event";

test("display bts diploma", async () => {
  jest.spyOn(api, "useNiveaux").mockImplementation(() => ({
    data: [
      {
        niveau: { value: "1", count: 10 },
        diplomes: [
          { value: "bts", count: 8 },
          { value: "cap", count: 30 },
        ],
      },
    ],
  }));

  const onSuggestionSelected = jest.fn();

  const { getByText, queryByText, getByPlaceholderText, getByTestId } = render(
    <DiplomesAutosuggest onSuggestionSelected={onSuggestionSelected} />
  );

  await waitFor(() => getByPlaceholderText(/^Recherchez un diplôme$/i));
  const input = getByPlaceholderText(/^Recherchez un diplôme$/i);

  await userEvent.type(input, "b");
  expect(input.value).toEqual("b");

  await waitFor(() => getByText("bts"));

  const btsOption = queryByText("bts");
  expect(btsOption).toBeInTheDocument();

  const capOption = queryByText(/^cap$/i);
  expect(capOption).not.toBeInTheDocument();

  await userEvent.click(btsOption);
  expect(onSuggestionSelected).toHaveBeenCalledWith({ suggestion: { count: 8, niveau: "1", value: "bts" } });

  const clearBtn = getByTestId("clear-btn");
  expect(clearBtn).toBeInTheDocument();

  await userEvent.click(clearBtn);
  expect(btsOption).not.toBeInTheDocument();
  expect(input.value).toEqual("");
});
