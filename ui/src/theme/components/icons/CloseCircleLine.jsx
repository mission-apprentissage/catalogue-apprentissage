import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as CloseCircleLineIcon } from "../../assets/close-circle-line.svg";

export const CloseCircleLine = (props) => {
  return <Icon as={CloseCircleLineIcon} {...props} />;
};
