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
    pill: {
      fontSize: "zeta",
      color: "bluefrance",
      px: 3,
      py: 1,
      _hover: { bg: "grey.200", textDecoration: "none", borderRadius: 16 },
    },
    summary: {
      fontSize: "zeta",
      _hover: { textDecoration: "none", bg: "grey.200" },
      p: 2,
    },
  },
};

export { Link };
