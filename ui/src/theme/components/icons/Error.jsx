import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ErrorIcon } from "../../assets/error.svg";

export const Error = (props) => {
  return <Icon as={ErrorIcon} {...props} />;
};
