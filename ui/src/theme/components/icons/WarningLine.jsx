import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as WarningLineIcon } from "../../assets/warning-line.svg";

export const WarningLine = (props) => {
  return <Icon as={WarningLineIcon} {...props} />;
};
