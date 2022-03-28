import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ValidateIcon } from "../../assets/validate.svg";

export const Validate = (props) => {
  return <Icon as={ValidateIcon} {...props} />;
};
