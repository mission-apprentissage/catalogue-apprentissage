import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as TickIcon } from "../../assets/tick.svg";

export const Tick = (props) => {
  return <Icon as={TickIcon} {...props} />;
};
