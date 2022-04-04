import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as AddFillIcon } from "../../assets/add-fill.svg";

export const AddFill = (props) => {
  return <Icon as={AddFillIcon} {...props} />;
};
