import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as TrashIcon } from "../../assets/trash.svg";

export const Trash = (props) => {
  return <Icon as={TrashIcon} {...props} />;
};
