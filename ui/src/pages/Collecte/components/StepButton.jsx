import React from "react";
import { Button, IconButton, Text } from "@chakra-ui/react";

export default ({ title, stepNumber, currentStep, active, disabled, onClick }) => {
  return (
    <Button
      disabled={currentStep < stepNumber}
      variant="secondary"
      onClick={() => {
        onClick(stepNumber);
      }}
      leftIcon={
        <IconButton
          as="div"
          isRound
          bg={currentStep === stepNumber ? "bluefrance" : "gray.600"}
          color="white"
          size="sm"
          icon={stepNumber && <Text>{stepNumber}</Text>}
        />
      }
      px={8}
      py={2}
      fontWeight="bold"
      h="auto"
      color={currentStep === stepNumber ? "bluefrance" : "gray.600"}
      border="1px solid #cecece !important"
    >
      {title}
    </Button>
  );
};
