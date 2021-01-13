import React from "react";
import { Container, Box } from "@chakra-ui/react";
import Layout from "../layout/Layout";

import "./howToSignal.css";

const HowToSignal = () => {
  return (
    <Layout>
      <div className="page howToSignal">
        <Container className="mt-5" maxW="xl">
          <Box>
            <Box className="mission-summary">
              <h1 className="mt-3 mb-3">Guide de signalements</h1>
              <br />
              <p>[Contenu]</p>
              <ul>
                <li>Bullet point</li>
                <li>Bullet point</li>
              </ul>
            </Box>
          </Box>
        </Container>
      </div>
    </Layout>
  );
};

export default HowToSignal;
