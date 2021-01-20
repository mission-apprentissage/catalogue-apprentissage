const Tabs = {
  parts: ["tablist", "tab", "tabpanel"],
  baseStyle: {
    tablist: {
      px: [0, 24],
      border: "none",
      bg: "secondaryBackground",
      color: "grey.750",
    },
    tabpanel: {
      px: [8, 24],
      color: "grey.100",
      h: 1000,
    },
    tab: { color: "grey.500", _focus: { boxShadow: "none", outlineWidth: 0 } },
  },
  variants: {
    line: {
      tab: {
        fontSize: ["epsilon", "gamma"],
        _selected: { color: "grey.800", borderBottom: "4px solid", borderColor: "grey.750" },
      },
    },
  },
};

export { Tabs };
