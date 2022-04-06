import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as SubtractLineIcon } from "../../assets/substract-line.svg";

export const SubtractLine = (props) => {
  return <Icon as={SubtractLineIcon} {...props} />;
};
