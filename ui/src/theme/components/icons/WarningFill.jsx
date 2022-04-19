import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as WarningFillIcon } from "../../assets/warning-fill.svg";

export const WarningFill = (props) => {
  return <Icon as={WarningFillIcon} {...props} />;
};
