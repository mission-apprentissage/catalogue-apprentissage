import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as SuccessFillIcon } from "../../assets/success-fill.svg";

export const SuccessFill = (props) => {
  return <Icon as={SuccessFillIcon} {...props} />;
};
