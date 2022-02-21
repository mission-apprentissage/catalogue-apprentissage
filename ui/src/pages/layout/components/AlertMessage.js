import React, { useState, useEffect } from "react";
import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Text, Flex } from "@chakra-ui/react";
import { _get, _delete } from "../../../common/httpClient";
import useAuth from "../../../common/hooks/useAuth";
import { hasAccessTo } from "../../../common/utils/rolesUtils";

const AlertMessage = () => {
  let [auth] = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const data = await _get("/api/v1/entity/messageScript");
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

  const onDeleteClicked = async (e) => {
    e.preventDefault();
    try {
      const messageDeleted = await _delete("/api/v1/entity/messageScript");
      if (messageDeleted) {
        alert("Le message MANUEL seulement a bien été supprimé.");
      }
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };
  if (messages.length === 0) return null;
  return (
    <Box m={0} fontSize={["omega", "omega", "epsilon"]}>
      <Alert status="error" flexDirection={["column", "column", "column", "row"]} m={0}>
        <Flex m={0} p={0}>
          <Flex m={0}>
            <AlertIcon boxSize={6} />
          </Flex>
          <AlertTitle m={0} p={0}>
            Maintenance&nbsp;:
          </AlertTitle>
        </Flex>
        <AlertDescription m={0} pl={2}>
          {messages.map((element) => element.enabled && <Text key={element._id}>{element.msg}</Text>)}
        </AlertDescription>
        {auth && hasAccessTo(auth, "page_message_maintenance") && (
          <CloseButton position="absolute" right="8px" top="8px" onClick={onDeleteClicked} />
        )}
      </Alert>
    </Box>
  );
};

export default AlertMessage;
