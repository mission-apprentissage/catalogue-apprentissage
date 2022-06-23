import React from "react";
import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { ArrowRightLine } from "../../theme/components/icons";

export const Card = ({ info, linkTo, title, body, isDisabled, color }) => {
  const CardContent = () => (
    <Flex flexDirection="column" h="full">
      <Box>
        <Flex display={["none", "flex"]} textStyle="md">
          <Text color={!isDisabled ? "bluefrance" : "grey.600"}>{info}</Text>
        </Flex>
        <Heading textStyle="h6" color={!isDisabled ? "grey.800" : "grey.600"} mt={2} mb={2}>
          {title}
        </Heading>
      </Box>
      <Flex flexDirection="column" flexGrow="1">
        <Text textStyle="md" color="grey.600">
          {body}
        </Text>
      </Flex>
      <Flex justifyContent="flex-end">
        {!isDisabled && <ArrowRightLine alignSelf="center" color="bluefrance" boxSize={4} />}
      </Flex>
    </Flex>
  );
  return (
    <>
      {!isDisabled ? (
        <Link as={NavLink} to={linkTo} variant="card" h="100%" p={6} backgroundColor={color}>
          <CardContent />
        </Link>
      ) : (
        <Text variant="card" as="div" h="100%" p={6} backgroundColor={color}>
          <CardContent />
        </Text>
      )}
    </>
  );
};
