const commonStatusBadgeStyle = {
  fontSize: "omega",
  borderRadius: 20,
  pl: 1,
  pr: 3,
  py: 1,
  textTransform: "none",
  fontWeight: 400,
};

const Badge = {
  variants: {
    notRelevant: {
      ...commonStatusBadgeStyle,
      bg: "#e3e8ea",
      color: "grey.800",
      border: "1px solid",
      borderColor: "#e3e8ea",
    },
    published: {
      ...commonStatusBadgeStyle,
      bg: "greenmedium.300",
      color: "grey.800",
      border: "1px solid",
      borderColor: "greenmedium.200",
    },
    notPublished: {
      ...commonStatusBadgeStyle,
      bg: "grey.300",
      color: "grey.800",
      border: "1px solid",
      borderColor: "grey.300",
    },
    toBePublished: {
      ...commonStatusBadgeStyle,
      bg: "orangemedium.300",
      color: "grey.800",
      border: "1px solid",
      borderColor: "orangemedium.300",
    },
    pending: {
      ...commonStatusBadgeStyle,
      bg: "greenmedium.200",
      color: "#a3b3b7",
      border: "1px solid",
      borderColor: "greenmedium.200",
    },
  },
};

export { Badge };
