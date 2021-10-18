import { Modal, ModalBody, ModalContent, ModalOverlay, Center, Spinner } from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import { Rapprochement } from "./Rapprochement";
import { ReconciliationModalHeader } from "./ReconciliationModalHeader";

import { getResult } from "../../../../common/api/rapprochement";

const ReconciliationModal = React.memo(({ isOpen, onClose: onCloseProp, data, onFormationUpdate, mnaFormation }) => {
  const [formation, setFormation] = useState();
  const [currentMnaFormation, setCurrentMnaFormation] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function run() {
      try {
        const form = await getResult({ id: data._id });
        setFormation(form);
        setCurrentMnaFormation(0);
        if (form.statut_reconciliation === "VALIDE" && form.etat_reconciliation) {
          setStep(3);
        }
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [data]);

  let onStepClicked = useCallback((s) => {
    setStep(s);
  }, []);

  let onValidationSubmit = useCallback(() => {
    setStep(1);
    // window.location.reload();
  }, []);
  let onClose = useCallback(() => {
    setStep(1);
    setFormation(null);
    onCloseProp();
  }, [onCloseProp]);

  if (!formation && isOpen) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" id="reconciliationPsModal">
      <ModalOverlay />
      <ModalContent bg="white" color="primaryText" borderRadius="none" my="0" minH="full" h="auto" px={20}>
        <ModalBody p={0} display="flex" flexDirection="column">
          <ReconciliationModalHeader
            formation={formation}
            onClose={onClose}
            onValidationSubmit={onValidationSubmit}
            onStepChanged={onStepClicked}
            step={step}
            onStepClicked={onStepClicked}
            onMnaFormationSelected={(index) => {
              setCurrentMnaFormation(index);
            }}
          />
          {formation && <Rapprochement formation={formation} currentMnaFormation={currentMnaFormation} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export { ReconciliationModal };
