import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as LinkLineIcon } from "../../assets/link-line.svg";

export const LinkLine = (props) => {
  return <Icon as={LinkLineIcon} {...props} />;
};
