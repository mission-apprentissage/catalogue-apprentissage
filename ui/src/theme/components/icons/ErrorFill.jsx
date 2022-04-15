import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ErrorFillIcon } from "../../assets/error-fill.svg";

export const ErrorFill = (props) => {
  return <Icon as={ErrorFillIcon} {...props} />;
};
