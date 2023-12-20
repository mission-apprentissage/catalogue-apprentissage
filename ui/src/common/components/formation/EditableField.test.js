import React from "react";
import { render } from "@testing-library/react";
import { EditableField } from "./EditableField";
import userEvent from "@testing-library/user-event";

test("should render on editable field on read mode", async () => {
  const onEdit = jest.fn();
  const handleChange = jest.fn();
  const handleSubmit = jest.fn();

  const { queryByText, queryByTestId } = render(
    <EditableField
      formation={{ city: "Montpellier" }}
      hasRightToEdit={true}
      edition={""}
      fieldName={"city"}
      onEdit={onEdit}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={{ city: "Montpellier" }}
      label={"ville"}
    />
  );

  const label = queryByText(/ville/i);
  expect(label).toBeInTheDocument();

  const editBtn = queryByTestId("edit-btn");

  await userEvent.click(editBtn);
  expect(onEdit).toHaveBeenCalledWith("city");

  const cancelBtn = queryByText(/Annuler/i);
  expect(cancelBtn).not.toBeInTheDocument();

  const saveBtn = queryByText(/Valider/i);
  expect(saveBtn).not.toBeInTheDocument();
});

test("should render on editable field on edit mode", async () => {
  const onEdit = jest.fn();
  const handleChange = jest.fn();
  const handleSubmit = jest.fn();

  const { queryByText, queryByTestId } = render(
    <EditableField
      formation={{ city: "Montpellier" }}
      hasRightToEdit={true}
      edition={"city"}
      fieldName={"city"}
      onEdit={onEdit}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      values={{ city: "Montpellier" }}
      label={"ville"}
    />
  );

  const label = queryByText(/ville/i);
  expect(label).toBeInTheDocument();

  const input = queryByTestId("input");
  expect(input).toBeInTheDocument();

  await userEvent.type(input, "Nice");
  expect(handleChange).toHaveBeenCalled();

  const cancelBtn = queryByText(/Annuler/i);
  expect(cancelBtn).toBeInTheDocument();

  await userEvent.click(cancelBtn);
  expect(onEdit).toHaveBeenCalledWith();

  const saveBtn = queryByText(/Valider/i);
  expect(saveBtn).toBeInTheDocument();

  await userEvent.click(saveBtn);
  expect(handleSubmit).toHaveBeenCalled();
});
