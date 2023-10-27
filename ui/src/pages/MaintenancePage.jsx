import React, { useCallback } from "react";
import { Box, Text, Heading, Button } from "@chakra-ui/react";
import AlertMessage from "./layout/components/AlertMessage";

const MaintenancePage = () => {
  const reload = useCallback(() => {
    window.location.reload();
  });

  return (
    <>
      <AlertMessage />
      <Box py={[4, 8]} px={[8, 24]} color="grey.750">
        <Heading fontFamily="Marianne" fontWeight="400" fontSize={["gamma", "beta"]} pb={4}>
          Le service est en maintenance.
        </Heading>
        <Text pb={2}>Veuillez réessayer ultérieurement.</Text>
        <Button variant="link" onClick={reload}>
          Recharger la page
        </Button>
      </Box>
    </>
  );
};

export default MaintenancePage;
