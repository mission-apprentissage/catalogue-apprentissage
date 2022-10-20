import React, { useState, useEffect } from "react";
import { Box, Alert, AlertIcon, AlertDescription, Text, Flex } from "@chakra-ui/react";
import { _get } from "../../../common/httpClient";

const AlertMessage = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const data = await _get("/api/entity/alert");
        const hasMessages = data.reduce((acc, item) => acc || item.enabled, false);
        if (hasMessages && mounted) {
          setMessages(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();

    return () => {
      // cleanup hook
      mounted = false;
    };
  }, []);

  if (messages.length === 0) return null;
  return (
    <Box m={0} fontSize={["omega", "omega", "epsilon"]}>
      <Alert status="error" flexDirection={["column", "column", "column", "row"]} m={0}>
        <Flex m={0} p={0}>
          <Flex m={0}>
            <AlertIcon boxSize={6} />
          </Flex>
        </Flex>
        <AlertDescription m={0} pl={2}>
          {messages.map((element) => element.enabled && <Text key={element._id}>• {element.msg}</Text>)}
        </AlertDescription>
      </Alert>
    </Box>
  );
};

export default AlertMessage;
