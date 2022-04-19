import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as SuccessLineIcon } from "../../assets/success-line.svg";

export const SuccessLine = (props) => {
  return <Icon as={SuccessLineIcon} {...props} />;
};
