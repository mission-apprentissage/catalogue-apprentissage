import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ErrorLineIcon } from "../../assets/error-line.svg";

export const ErrorLine = (props) => {
  return <Icon as={ErrorLineIcon} {...props} />;
};
