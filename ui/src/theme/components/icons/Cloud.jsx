import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as CloudIcon } from "../../assets/cloud.svg";

export const Cloud = (props) => {
  return <Icon as={CloudIcon} {...props} />;
};
