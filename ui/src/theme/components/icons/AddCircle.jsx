import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as AddCircleIcon } from "../../assets/add-circle.svg";

export const AddCircle = (props) => {
  return <Icon as={AddCircleIcon} {...props} />;
};
