import React from "react";
import { Box, Flex } from "@chakra-ui/react";

import { colors } from "../../theme/theme-beta";
import { SuccessFill, ErrorFill, WarningFill, InfoFill } from "../../theme/components/icons";

const styles = {
  success: {
    color: colors.success,
    Icon: SuccessFill,
  },
  error: {
    color: colors.error,
    Icon: ErrorFill,
  },
  warning: {
    color: colors.warning,
    Icon: WarningFill,
  },
  info: {
    color: colors.info,
    Icon: InfoFill,
  },
  infoLignt: {
    color: colors.bluesoft[400],
    Icon: InfoFill,
  },
};

export const Alert = ({ type = "info", children, ...props }) => {
  const style = styles[type];

  return (
    <Flex style={{ border: `1px solid ${style.color}` }} {...props}>
      <Box style={{ backgroundColor: style.color, color: "white" }}>
        <style.Icon w="24px" h="24px" mx={2} my={4} />
      </Box>
      <Box p={4}>{children}</Box>
    </Flex>
  );
};
