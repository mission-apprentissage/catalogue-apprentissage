import React from "react";
import { CircularProgress, Center } from "@chakra-ui/react";

export default (props) => {
  return (
    <Center h={props.height ? props.height : "100vh"}>
      <CircularProgress isIndeterminate size={props.size ? props.size : "3em"} />
    </Center>
  );
};
