import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as MenuFillIcon } from "../../assets/menu-fill.svg";

export const MenuFill = (props) => {
  return <Icon as={MenuFillIcon} {...props} />;
};
