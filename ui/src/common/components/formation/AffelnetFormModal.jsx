import React from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { _put } from "../../httpClient";

const endpointNewFront = process.env.REACT_APP_ENDPOINT_NEW_FRONT || "https://catalogue.apprentissage.beta.gouv.fr/api";

const AffelnetFormModal = ({ isOpen, onClose, formation }) => {
  const { values, handleSubmit, handleChange, isSubmitting } = useFormik({
    initialValues: {
      affelnet_infos_offre: formation.affelnet_infos_offre,
    },
    onSubmit: (values) => {
      return new Promise(async (resolve) => {
        await _put(`${endpointNewFront}/entity/formations2021/${formation._id}`, {
          num_academie: formation.num_academie,
          affelnet_infos_offre: values.affelnet_infos_offre,
        });

        onClose();
        resolve("onSubmitHandler complete");
      });
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText">
        <ModalCloseButton color="grey.600" _focus={{ boxShadow: "none", outlineWidth: 0 }} size="lg" />
        <ModalHeader pt={[3, 20]} pb={[3, 8]} bg="#f5f8f9" borderRadius="5px 5px 0 0">
          <Center>
            <Heading as="h2" fontSize="alpha">
              Affelnet : Informations complémentaires
            </Heading>
          </Center>
        </ModalHeader>
        <ModalBody p={0}>
          <Box px={[2, 16]}>
            <Flex px={4} py={[12, 16]} flexDirection="column">
              <FormControl display="flex" alignItems="center" w="auto">
                <FormLabel htmlFor="affelnet_infos_offre" mb={0} fontSize="delta" fontWeight={700}>
                  Informations offre de formation (facultatif) :
                </FormLabel>
                <Textarea
                  name="affelnet_infos_offre"
                  value={values.affelnet_infos_offre}
                  onChange={handleChange}
                  placeholder="Démarches sur obtention contrat apprentissage, modalités inscription, rythme alternance, date entrée formation..."
                  size="sm"
                />
              </FormControl>
            </Flex>
          </Box>
          <Box borderTop="1px solid" borderColor="grey.300" p={0}>
            <Flex flexDirection={["column", "row"]} py={[3, 8]} px={3} justifyContent="center">
              <Button
                type="submit"
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Enregistrement des modifications"
              >
                Enregistrer
              </Button>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { AffelnetFormModal };
