import React from "react";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import * as Yup from "yup";
import { ArrowRightLine, Close } from "../../../theme/components/icons";
import { _put } from "../../httpClient";
import { useFormik } from "formik";
import { sortAscending, sortDescending } from "../../utils/historyUtils";

const CATALOGUE_API = `${process.env.REACT_APP_BASE_URL}/api`;

const ResponsableEmailModal = ({ isOpen, onClose, formation, responsable, callback }) => {
  const initialRef = React.useRef();
  const toast = useToast();

  const updates_history = [
    ...responsable.updates_history?.sort(sortDescending),
    ...(responsable?.email_direction && responsable?.emails_potentiels?.length === 1
      ? [
          {
            from: {},
            to: {
              email_direction: responsable.updates_history?.filter((history) => !!history.to.email_direction).length
                ? responsable.updates_history?.filter((history) => !!history.to.email_direction).sort(sortAscending)[0]
                    .from.email_direction
                : responsable.email_direction,
            },
          },
        ]
      : []),
  ];

  const {
    values,
    setValues,
    setFieldValue,
    handleChange,
    handleSubmit,
    isSubmitting,
    errors,
    touched,
    validateForm,
    validateField,
    isInvalid,
  } = useFormik({
    initialValues: {
      email_direction:
        responsable?.editedFields?.email_direction ??
        responsable?.email_direction ??
        formation?.etablissement_gestionnaire_courriel,
    },
    validateOnChange: true,
    validationSchema: Yup.object().shape({
      email_direction: Yup.string().email(),
    }),
    enableReinitialize: true,
    onSubmit: async ({ email_direction }, { setSubmitting }) => {
      try {
        setSubmitting(true);
        await _put(`${CATALOGUE_API}/entity/etablissement/${responsable._id}`, {
          email_direction,
        });

        setSubmitting(false);
        onClose();
        await callback?.();
      } catch (error) {
        setSubmitting(false);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la modification de l'adresse courriel du responsable",
          status: "error",
          duration: 10000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" ref={initialRef}>
        <Button
          display={"flex"}
          alignSelf={"flex-end"}
          color="bluefrance"
          fontSize={"epsilon"}
          onClick={onClose}
          variant="unstyled"
          p={8}
          fontWeight={400}
        >
          fermer{" "}
          <Text as={"span"} ml={2}>
            <Close boxSize={4} />
          </Text>
        </Button>
        <ModalHeader px={[4, 16]} pt={[3, 6]} pb={[3, 6]}>
          <Text as="h2" fontSize="2rem">
            <Flex>
              <Text as={"span"}>
                <ArrowRightLine boxSize={26} />
              </Text>
              <Text as={"span"} ml={4}>
                Modifier l'adresse du contact responsable
              </Text>
            </Flex>
          </Text>
        </ModalHeader>
        <ModalBody px={[4, 16]} pb={[4, 16]}>
          <form onSubmit={handleSubmit}>
            <FormControl
              display="flex"
              flexDirection="column"
              w="auto"
              name="email_direction"
              value={values.email_direction}
              isInvalid={touched.email_direction && errors.email_direction}
            >
              <FormLabel for="email_direction" htmlFor="affelnet" mb={3} fontSize="epsilon" fontWeight={400}>
                Adresse du contact responsable
              </FormLabel>
              <Input
                id="email_direction"
                name="email_direction"
                placeholder="123@uvw.xyz"
                value={values.email_direction}
                onChange={handleChange}
              />
              <FormErrorMessage>{errors.email_direction}</FormErrorMessage>
            </FormControl>

            <Flex flexDirection={["column", "row"]} p={[3, 8]} justifyContent="flex-end">
              <Button variant="secondary" onClick={onClose} mr={[0, 4]} mb={[3, 0]}>
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Sauvegarde en cours..."
              >
                Sauvegarder
              </Button>
            </Flex>
          </form>
          <br />
          <Text>
            <Text as="b">Historique des modifications :</Text>
          </Text>
          <br />
          {updates_history?.length ? (
            <UnorderedList>
              {updates_history?.map((history, index) => (
                <ListItem key={index} mb="8px">
                  {history.from?.email_direction?.length > 0 && history.to?.email_direction?.length > 0 && (
                    <>
                      Modification de l'adresse courriel
                      <Text as="span" variant="highlight" mx="0.5rem">
                        {history.from?.email_direction ?? ""}
                      </Text>
                      à
                      <Text as="span" variant="highlight" mx="0.5rem">
                        {history.to?.email_direction ?? ""}
                      </Text>
                    </>
                  )}

                  {history.from?.email_direction?.length > 0 && history.to?.email_direction?.length === 0 && (
                    <>
                      Suppression de l'adresse courriel
                      <Text as="span" variant="highlight" mx="0.5rem">
                        {history.from?.email_direction ?? ""}
                      </Text>
                    </>
                  )}

                  {(!history.from?.email_direction || history.from?.email_direction?.length === 0) &&
                    history.to?.email_direction?.length > 0 && (
                      <>
                        Définition de l'adresse courriel à
                        <Text as="span" variant="highlight" mx="0.5rem">
                          {history.to?.email_direction ?? ""}
                        </Text>
                      </>
                    )}

                  <Text as="span" variant={"unstyled"} fontSize={"zeta"} fontStyle={"italic"} color={"grey.600"}>
                    {history.updated_at && (
                      <>
                        {" "}
                        le {new Date(history.updated_at).toLocaleDateString()} à{" "}
                        {new Date(history.updated_at).toLocaleTimeString()}{" "}
                      </>
                    )}
                    {history.to?.last_update_who ? (
                      <>par {history.to?.last_update_who}</>
                    ) : (
                      <>(Valeur issue des enregistrements auprès du Carif-Oref)</>
                    )}
                  </Text>
                </ListItem>
              ))}
            </UnorderedList>
          ) : (
            <>Aucun historique à afficher</>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ResponsableEmailModal };
