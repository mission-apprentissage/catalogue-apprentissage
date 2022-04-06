import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as CloseIcon } from "../../assets/close.svg";

export const Close = (props) => {
  return <Icon as={CloseIcon} {...props} />;
};
