import React from "react";
import { Button, Input, Text } from "@chakra-ui/react";
import { Edit2Fill } from "../../../theme/components/icons";
import InfoTooltip from "../InfoTooltip";
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
  return (
    <Text {...props}>
      {hasRightToEdit && edition !== fieldName && (
        <Button
          onClick={() => onEdit(fieldName)}
          variant="unstyled"
          aria-label={`Modifier le champ ${label}`}
          p={0}
          minW={0}
          height="auto"
          data-testid={"edit-btn"}
        >
          <Edit2Fill w="16px" h="16px" color="bluefrance" mr="5px" mb="7px" />
        </Button>
      )}{" "}
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
    </Text>
  );
};
