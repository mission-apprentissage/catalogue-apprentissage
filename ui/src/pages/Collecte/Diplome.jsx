import { Box, Flex, Heading, Button, FormControl, FormLabel, RadioGroup, HStack, Radio } from "@chakra-ui/react";
import React, { useState } from "react";
import { Cfd } from "./components/Cfd";
import { Rncp } from "./components/rncp";

const Diplome = ({ onSubmited }) => {
  const [typeCode, setTypeCode] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [cfd, setCfd] = useState();
  // eslint-disable-next-line no-unused-vars
  const [rncp, setRncp] = useState();
  const [isDisabled, setIsDisabled] = useState(true);

  return (
    <Box border="1px solid" borderColor="bluefrance" w="full">
      <Flex px={[4, 16]} pb={[4, 16]} flexDirection="column">
        <Heading as="h3" fontSize="1.5rem" my={3}>
          Diplôme
        </Heading>

        <FormControl as="fieldset" display="flex" mt={5}>
          <FormLabel as="div">Ajouter un diplôme par :</FormLabel>
          <RadioGroup id="sameFormateur" name="sameFormateur">
            <HStack spacing="24px">
              <Radio
                value="cfd"
                size="lg"
                onChange={(evt) => {
                  setTypeCode("cfd");
                  setCfd(null);
                  setIsDisabled(true);
                }}
              >
                Code Formation Diplôme
              </Radio>
              <Radio
                value="rncp"
                size="lg"
                onChange={(evt) => {
                  setTypeCode("rncp");
                  setCfd(null);
                  setIsDisabled(true);
                }}
              >
                Fiche RNCP
              </Radio>
            </HStack>
          </RadioGroup>
        </FormControl>

        {typeCode === "cfd" && (
          <Cfd
            onSubmited={(result) => {
              console.log(result);
              setCfd(result.cfd);
              setIsDisabled(false);
            }}
          />
        )}
        {typeCode === "rncp" && (
          <Rncp
            onSubmited={(result) => {
              console.log(result);
              setRncp(result.rncp);
              setIsDisabled(false);
            }}
          />
        )}
      </Flex>
      <Box boxShadow={"0 -4px 16px 0 rgba(0, 0, 0, 0.08)"}>
        <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
          <Button
            type="submit"
            variant="primary"
            // onClick={() => {
            //   onSubmited(adresse);
            // }}
            isDisabled={isDisabled}
          >
            Confirmer ce diplôme
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export { Diplome };
