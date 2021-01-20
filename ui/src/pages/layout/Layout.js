import React from "react";
import { Container } from "@chakra-ui/react";

import Footer from "./components/Footer";
import Header from "./components/Header";
import NavigationMenu from "./components/NavigationMenu";

const Layout = (props) => {
  return (
    <Container maxW="full" p={0}>
      <Header />
      <NavigationMenu />
      {props.children}
      <Footer />
    </Container>
  );
};

export default Layout;
