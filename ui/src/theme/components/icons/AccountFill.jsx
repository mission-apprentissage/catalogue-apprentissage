import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as AccountFillIcon } from "../../assets/account-fill.svg";

export const AccountFill = (props) => {
  return <Icon as={AccountFillIcon} {...props} />;
};
