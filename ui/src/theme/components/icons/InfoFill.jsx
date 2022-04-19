import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as InfoFillIcon } from "../../assets/info-fill.svg";

export const InfoFill = (props) => {
  return <Icon as={InfoFillIcon} {...props} />;
};
