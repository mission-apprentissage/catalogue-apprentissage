import { Box, Avatar, AvatarBadge } from "@chakra-ui/react";
import React from "react";
import { ErrorIcon } from "../../../../theme/components/icons";

const ButtonIndicator = ({ text, withIcon, active, onClicked, ...props }) => {
  return (
    <Avatar
      icon={
        <Box
          boxSize="2.25em"
          bg={active ? "bluefrance" : "galt"}
          fontSize="md"
          fontWeight="semibold"
          color={active ? "white" : "grey.800"}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          ml="3.5"
        >
          {text}
        </Box>
      }
      bg="none"
      h="auto"
      w="auto"
      cursor="pointer"
      onClick={onClicked}
      {...props}
    >
      {withIcon && (
        <AvatarBadge
          boxSize="0.9em"
          bg="white"
          fontSize="sm"
          fontWeight="semibold"
          color="tomato"
          top="-0.5rem"
          left="1.5rem"
        >
          <ErrorIcon color="redmarianne" width="20px" height="20px" />
        </AvatarBadge>
      )}
    </Avatar>
  );
};

export { ButtonIndicator };
