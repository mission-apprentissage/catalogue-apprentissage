import React from "react";
import { Container } from "@chakra-ui/react";
import { Layout, Accordion, Loading } from "./components";

import { _get } from "../../common/httpClient";

function PageReconciliation() {
  const [coverage, setCoverage] = React.useState();

  async function getCoverage(type) {
    const response = await _get(`http://localhost/api/coverage?type=${type}`);
    setCoverage(response);
  }

  React.useEffect(() => {
    getCoverage(3);
  }, []);

  if (!coverage) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="full">
        {coverage.map((item, index) => (
          <Accordion data={item} key={index} />
        ))}
      </Container>
    </Layout>
  );
}

export default PageReconciliation;
