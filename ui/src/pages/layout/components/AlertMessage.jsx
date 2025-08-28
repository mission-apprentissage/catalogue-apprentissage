import { useEffect, useCallback, useRef } from "react";
import { Box, Alert, AlertIcon, AlertDescription, Text, Flex } from "@chakra-ui/react";
import { _get } from "../../../common/httpClient";
import { alerts, setAlerts } from "../../../common/store/alertStore";

export const AlertMessage = () => {
  const mounted = useRef(false);

  const getMessages = useCallback(async () => {
    try {
      const data = await _get("/api/entity/alert", {
        handleResponse: (path, res) => {
          let statusCode = res.status;

          if (statusCode >= 200 && statusCode < 300) {
            return res.json();
          } else {
            throw new Error(`Error ${statusCode}`);
          }
        },
      });
      setAlerts(data?.filter((item) => item.enabled) ?? []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    let interval;

    const run = async () => {
      mounted.current = true;
      await getMessages();
      interval = setInterval(async () => {
        await getMessages();
      }, 60000);
    };

    if (!mounted.current) {
      run();
    }

    return () => {
      mounted.current = false;
      interval && clearInterval(interval);
    };
  }, [getMessages]);

  if (alerts.value?.length === 0) return null;

  return (
    <Box m={0} fontSize={["omega", "omega", "epsilon"]} data-testid="container">
      <Alert status="error" flexDirection={["column", "column", "column", "row"]} m={0}>
        <Flex m={0} p={0}>
          <Flex m={0}>
            <AlertIcon boxSize={6} />
          </Flex>
        </Flex>
        <AlertDescription m={0} pl={2}>
          {alerts.value?.map(
            (element) =>
              element.enabled && (
                <Text data-testid={element._id} key={element._id}>
                  • {element.msg}
                </Text>
              )
          )}
        </AlertDescription>
      </Alert>
    </Box>
  );
};

export default AlertMessage;
