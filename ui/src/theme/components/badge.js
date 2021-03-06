const commonStatusBadgeStyle = {
  fontSize: "omega",
  fontWeight: 400,
  borderRadius: 20,
  pl: 1,
  pr: 3,
  py: 1,
  textTransform: "none",
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
    reject: {
      ...commonStatusBadgeStyle,
      bg: "#D5DBEF",
      color: "grey.800",
      border: "1px solid",
      borderColor: "#D5DBEF",
    },
    unknown: {
      ...commonStatusBadgeStyle,
      bg: "#D5DBEF",
      color: "grey.800",
      border: "1px solid",
      borderColor: "#D5DBEF",
    },
    year: {
      ...commonStatusBadgeStyle,
      bg: "greenmedium.300",
      color: "grey.800",
      pl: "15px",
      pr: "15px",
    },
  },
};

export { Badge };
