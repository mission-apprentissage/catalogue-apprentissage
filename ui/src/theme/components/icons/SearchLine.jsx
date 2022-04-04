import React from "react";
import { Icon } from "@chakra-ui/icons";

import { ReactComponent as SearchLineIcon } from "../../assets/search-line.svg";

export const SearchLine = (props) => {
  return <Icon as={SearchLineIcon} {...props} />;
};
