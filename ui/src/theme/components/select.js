const commonFieldStyle = {
  color: "grey.800",
  borderBottomRadius: 0,
  borderWidth: 0,
  borderBottom: "2px solid",
  marginBottom: "-2px",
  borderColor: "grey.600",
  bg: "grey.200",
  _focus: {
    borderColor: "grey.600",
    boxShadow: "none",
    outline: "2px solid",
    outlineColor: "info",
    outlineOffset: "2px",
    borderTopRadius: "4px",
  },
  _invalid: {
    borderColor: "grey.600",
    boxShadow: "none",
    outline: "2px solid",
    outlineColor: "error",
    outlineOffset: "2px",
    borderTopRadius: "4px",
  },
};

const Select = {
  parts: ["field"],
  variants: {
    edition: {
      field: {
        ...commonFieldStyle,
        fontWeight: 700,
      },
    },
    outline: {
      field: {
        ...commonFieldStyle,
      },
    },
  },
};

export { Select };
