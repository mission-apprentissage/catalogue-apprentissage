import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as LockFillIcon } from "../../assets/lock-fill.svg";

export const LockFill = (props) => {
  return <Icon as={LockFillIcon} {...props} />;
};
