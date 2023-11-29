import React from "react";
import { Button, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { EyeFill, EyeOffFill } from "../../theme/components/icons";

export const PasswordInput = (props) => {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  return (
    <InputGroup size="md">
      <Input pr="4.5rem" placeholder="Enter password" {...props} type={show ? "text" : "password"} />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick}>
          {show ? <EyeOffFill /> : <EyeFill />}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};
