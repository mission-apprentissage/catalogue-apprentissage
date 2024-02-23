import React from "react";
import { Button, Input, Text } from "@chakra-ui/react";
import { Edit2Fill } from "../../../theme/components/icons";
import { InfoTooltip } from "../InfoTooltip";
import helpText from "../../../locales/helpText.json";

export const EditableField = ({
  formation,
  hasRightToEdit,
  edition,
  onEdit,
  handleSubmit,
  values,
  handleChange,
  fieldName,
  label,
  ...props
}) => {
  console.log(values);
  return (
    <Text {...props}>
      {label} :{" "}
      {edition !== fieldName && (
        <>
          <Text as="span" variant="highlight">
            {formation[fieldName]}
          </Text>{" "}
          <InfoTooltip description={helpText.formation[fieldName]} />
        </>
      )}
      {edition === fieldName && (
        <>
          <Input
            data-testid={"input"}
            variant="edition"
            type="text"
            name={fieldName}
            onChange={handleChange}
            value={values[fieldName]}
          />
          <Button mt={2} mr={2} variant="secondary" onClick={() => onEdit()}>
            Annuler
          </Button>
          <Button mt={2} variant="primary" onClick={handleSubmit}>
            Valider
          </Button>
        </>
      )}
      {hasRightToEdit && edition !== fieldName && (
        <Button
          onClick={() => onEdit(fieldName)}
          aria-label={`Modifier le champ ${label}`}
          textStyle="sm"
          variant="primary"
          minW={null}
          px={4}
          mt={[8, 8, 2]}
          data-testid={"edit-btn"}
        >
          <Edit2Fill color="white" mr="2" />
          {formation[fieldName]?.length ? "Modifier le champ" : "Renseigner le champ"}
        </Button>
      )}{" "}
    </Text>
  );
};
