const commonStatusBadgeStyle = {
  fontSize: "zeta",
  borderRadius: 15,
  px: 3,
  py: 1,
  textTransform: "none",
  fontWeight: 600,
};

const Badge = {
  variants: {
    notRelevant: {
      ...commonStatusBadgeStyle,
      bg: "white",
      color: "primaryText",
      border: "1px solid",
      borderColor: "primaryText",
    },
    published: {
      ...commonStatusBadgeStyle,
      bg: "primaryText",
      color: "white",
      border: "1px solid",
      borderColor: "primaryText",
    },
    notPublished: {
      ...commonStatusBadgeStyle,
      bg: "white",
      color: "primaryText",
      border: "1px solid",
      borderColor: "primaryText",
    },
    toBePublished: {
      ...commonStatusBadgeStyle,
      bg: "#ffc29e",
      color: "primaryText",
      border: "1px solid",
      borderColor: "#ffc29e",
    },
    pending: {
      ...commonStatusBadgeStyle,
      bg: "white",
      color: "#a3b3b7",
      border: "1px solid",
      borderColor: "#ffc29e",
    },
  },
};

export { Badge };
