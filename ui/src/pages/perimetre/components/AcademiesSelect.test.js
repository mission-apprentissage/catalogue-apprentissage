import React from "react";
import { fireEvent, queryByText, render } from "@testing-library/react";
import { AcademiesSelect } from "./AcademiesSelect";

test("renders all academies for admins", () => {
  const onChange = jest.fn();
  const user = {
    permissions: { isAdmin: true },
    academie: "8,10",
  };

  const { getByText, container } = render(
    <AcademiesSelect plateforme={"parcoursup"} user={user} onChange={onChange} />
  );

  const nationalOption = getByText(/^au National$/i);
  expect(nationalOption).toBeInTheDocument();

  const niceOption = getByText(/^de Nice \(23\)$/i);
  expect(niceOption).toBeInTheDocument();

  expect(container.querySelectorAll("option")).toHaveLength(31);
});

test("renders no academies without user", () => {
  const onChange = jest.fn();
  const user = null;

  const { queryByText, container } = render(
    <AcademiesSelect plateforme={"parcoursup"} user={user} onChange={onChange} />
  );

  const nationalOption = queryByText(/^au National$/i);
  expect(nationalOption).not.toBeInTheDocument();

  const niceOption = queryByText(/^de Nice \(23\)$/i);
  expect(niceOption).not.toBeInTheDocument();

  expect(container.querySelectorAll("option")).toHaveLength(0);
});

test("renders only some academies if not admin", () => {
  const onChange = jest.fn();
  const user = {
    permissions: { isAdmin: false },
    academie: "8,10",
  };

  const { queryByText, container } = render(
    <AcademiesSelect plateforme={"parcoursup"} user={user} onChange={onChange} />
  );

  const nationalOption = queryByText(/^au National$/i);
  expect(nationalOption).not.toBeInTheDocument();

  const niceOption = queryByText(/^de Nice \(23\)$/i);
  expect(niceOption).not.toBeInTheDocument();

  const grenobleOption = queryByText(/^de Grenoble \(8\)$/i);
  expect(grenobleOption).toBeInTheDocument();

  const lyonOption = queryByText(/^de Lyon \(10\)$/i);
  expect(lyonOption).toBeInTheDocument();

  expect(container.querySelectorAll("option")).toHaveLength(2);
});

test("on change should be called with academie number", () => {
  const onChange = jest.fn();
  const user = {
    permissions: { isAdmin: true },
    academie: "8,10",
  };

  const { getByText, getByTestId } = render(
    <AcademiesSelect plateforme={"parcoursup"} user={user} onChange={onChange} />
  );

  const niceOption = getByText(/^de Nice \(23\)$/i);
  expect(niceOption).toBeInTheDocument();

  const select = getByTestId("academies");

  fireEvent.change(select, { target: { value: 23 } });
  expect(onChange).toHaveBeenCalledWith("23");

  fireEvent.change(select, { target: { value: "national" } });
  expect(onChange).toHaveBeenCalledWith(null);
});
