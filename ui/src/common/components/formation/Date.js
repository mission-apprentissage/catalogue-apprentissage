import React from "react";
import { Date } from "./Date";
import { render } from "@testing-library/react";

test("should display month grouped by year", () => {
  const { queryByText } = render(<Date date={["2021-05", "2021-09", "2022-01", "2022-02"]} />);

  const value21 = queryByText("2021 : mai, septembre");
  expect(value21).toBeInTheDocument();

  const value22 = queryByText("2022 : janvier, février");
  expect(value22).toBeInTheDocument();
});

test("should display Invalid date in case of error", () => {
  const { queryByText } = render(<Date date={["2021-05", "2021-09", "2022-0331"]} />);
  const value22 = queryByText("Date invalide : 2022-0331");
  expect(value22).toBeInTheDocument();
});

test("should display param in case of parsing error", () => {
  jest.spyOn(console, "error").mockImplementation(); // mute errors

  const { queryByText } = render(<Date date={"2021-05"} />);
  const paramValue = queryByText("2021-05");
  expect(paramValue).toBeInTheDocument();
});
