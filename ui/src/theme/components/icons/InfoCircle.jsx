import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as InfoCircleIcon } from "../../assets/info-circle.svg";

export const InfoCircle = (props) => {
  return <Icon as={InfoCircleIcon} {...props} />;
};
