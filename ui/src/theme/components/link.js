const Link = {
  baseStyle: {
    _focus: { boxShadow: "0 0 0 3px #3a55d1", outlineColor: "info" },
    _focusVisible: { outlineColor: "info" },
  },
  variants: {
    card: {
      p: 8,
      bg: "#F9F8F6",
      _hover: { bg: "#eceae3", textDecoration: "none" },
      display: "block",
    },
  },
};

export { Link };
