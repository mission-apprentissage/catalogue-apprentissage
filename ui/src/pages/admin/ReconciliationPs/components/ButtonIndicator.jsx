import { Box, Avatar, AvatarBadge } from "@chakra-ui/react";
import React from "react";
import { CheckLine } from "../../../../theme/components/icons";

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
          boxSize="1.2em"
          bg="#00ac8c"
          fontSize="sm"
          fontWeight="semibold"
          color="tomato"
          top="-0.5rem"
          left="1.5rem"
        >
          <CheckLine color="white" width="10px" height="10px" />
        </AvatarBadge>
      )}
    </Avatar>
  );
};

export { ButtonIndicator };