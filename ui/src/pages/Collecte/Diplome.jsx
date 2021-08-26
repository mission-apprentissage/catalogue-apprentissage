import { Box, Flex, Heading, Button, FormControl, FormLabel, RadioGroup, HStack, Radio } from "@chakra-ui/react";
import React, { useState } from "react";
import { Cfd } from "./components/Cfd";
import { Rncp } from "./components/rncp";
import { Periodes } from "./components/Periodes";

const Diplome = ({ onSubmited }) => {
  const [typeCode, setTypeCode] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [cfd, setCfd] = useState();
  // eslint-disable-next-line no-unused-vars
  const [rncp, setRncp] = useState();
  const [periodes, setPeriodes] = useState();
  const [codesSelected, setCodesSelected] = useState(false);
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
                  setCodesSelected(false);
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
                  setCodesSelected(false);
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
              setCfd(result.cfd);
              setRncp(result.rncp.code_rncp);
              setCodesSelected(true);
            }}
          />
        )}
        {typeCode === "rncp" && (
          <Rncp
            onSubmited={(result) => {
              setRncp(result.code_rncp);
              if (result.cfds) {
                setCodesSelected(true);
                // setCfd(result.cfds[0]);
              }
            }}
          />
        )}
        {codesSelected && (
          <Periodes
            onSubmited={(result) => {
              setPeriodes(result);
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
            onClick={() => {
              onSubmited({ cfd, rncp, periodes });
            }}
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
