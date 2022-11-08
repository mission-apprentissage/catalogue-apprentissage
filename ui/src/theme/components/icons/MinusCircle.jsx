import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as MinusCircleIcon } from "../../assets/minus-circle.svg";

export const MinusCircle = (props) => {
  return <Icon as={MinusCircleIcon} {...props} />;
};
