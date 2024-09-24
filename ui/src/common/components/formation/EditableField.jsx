import { memo } from "react";
import { Button, Input, Text } from "@chakra-ui/react";
import { Edit2Fill } from "../../../theme/components/icons";
import { InfoTooltip } from "../InfoTooltip";
import helpText from "../../../locales/helpText.json";

export const EditableField = memo(
  ({
    formation,
    hasRightToEdit,
    edition,
    onEdit,
    handleSubmit,
    values,
    handleChange,
    fieldName,
    label,
    emptyText = "Renseigner le champ",
    notEmptyText = "Modifier le champ",
    ...props
  }) => {
    return (
      <Text {...props}>
        {label} :{" "}
        {edition === fieldName && (
          <>
            <Input
              data-testid={"input"}
              variant="edition"
              type="text"
              autoFocus
              name={fieldName}
              onChange={handleChange}
              defaultValue={values[fieldName]}
            />
            <Button mt={2} mr={2} variant="secondary" onClick={() => onEdit()}>
              Annuler
            </Button>
            <Button mt={2} variant="primary" onClick={handleSubmit}>
              Valider
            </Button>
          </>
        )}
        {edition !== fieldName && (
          <>
            <Text as="span" variant="highlight">
              {formation[fieldName]}
            </Text>{" "}
            <InfoTooltip description={helpText.formation[fieldName]} />
            {hasRightToEdit && (
              <>
                <br />
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
                  {formation[fieldName]?.length
                    ? notEmptyText ?? "Modifier le champ"
                    : emptyText ?? "Renseigner le champ"}
                </Button>
              </>
            )}
          </>
        )}
      </Text>
    );
  },
  (prevProps, nextProps) => {
    return prevProps?.edition === nextProps?.edition;
  }
);
