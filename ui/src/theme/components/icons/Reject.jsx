import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as RejectIcon } from "../../assets/reject.svg";

export const Reject = (props) => {
  return <Icon as={RejectIcon} {...props} />;
};
