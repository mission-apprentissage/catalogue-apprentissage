import React from "react";
import { Layout, Accordion, Loading, Modal } from "./components";
import ContextProvider, { Context } from "./context";
import { _get } from "../../common/httpClient";
import { Container } from "@chakra-ui/react";

function PageReconciliation() {
  const [coverage, setCoverage] = React.useState();
  const { popup } = React.useContext(Context);

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

  console.log(coverage);

  return (
    <ContextProvider>
      <Layout>
        <Container maxW="full">
          <Accordion data={coverage[0]} />
        </Container>
        {popup && <Modal />}
      </Layout>
    </ContextProvider>
  );

  return (
    <ContextProvider>
      <Layout>
        {coverage.map((item, index) => (
          <Accordion data={item} key={index} />
        ))}
        {popup && <Modal />}
      </Layout>
    </ContextProvider>
  );
}

export default PageReconciliation;
