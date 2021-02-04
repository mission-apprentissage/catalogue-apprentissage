import React from "react";
import { Container } from "@chakra-ui/react";

import Footer from "./components/Footer";
import Header from "./components/Header";
import NavigationMenu from "./components/NavigationMenu";

const Layout = ({ children, ...rest }) => {
  return (
    <Container maxW="full" p={0} {...rest}>
      <Header />
      <NavigationMenu />
      {children}
      <Footer />
    </Container>
  );
};

export default Layout;
