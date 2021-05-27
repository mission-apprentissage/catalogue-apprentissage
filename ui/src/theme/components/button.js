const commonButtonStyle = {
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 400,
  _focus: { boxShadow: "0 0 0 3px #3a55d1", outlineColor: "info" },
};

const Button = {
  variants: {
    unstyled: {
      ...commonButtonStyle,
    },
    secondary: {
      ...commonButtonStyle,
      bg: "white",
      color: "bluefrance",
      border: "1px solid",
      borderColor: "bluefrance",
      _hover: { bg: "#efefef" },
    },
    primary: {
      ...commonButtonStyle,
      bg: "bluefrance",
      color: "white",
      _hover: { bg: "#0000dd" },
    },
  },
};

export { Button };
