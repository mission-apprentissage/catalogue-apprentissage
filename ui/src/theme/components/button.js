const commonButtonStyle = {
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 400,
  _focus: { boxShadow: "none", outlineWidth: 0 },
};

const Button = {
  variants: {
    secondary: {
      ...commonButtonStyle,
      bg: "white",
      color: "bluefrance",
      border: "1px solid",
      borderColor: "bluefrance",
    },
    primary: {
      ...commonButtonStyle,
      bg: "bluefrance",
      color: "white",
    },
  },
};

export { Button };
