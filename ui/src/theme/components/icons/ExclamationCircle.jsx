import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as ExclamationCircleIcon } from "../../assets/exclamation-circle.svg";

export const ExclamationCircle = (props) => {
  return <Icon as={ExclamationCircleIcon} {...props} />;
};
