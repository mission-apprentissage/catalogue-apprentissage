const Accordion = {
  parts: ["container", "button", "panel", "icon"],
  baseStyle: {
    container: { mb: 2 },
    button: { height: 14, _focus: { boxShadow: "0 0 0 3px #3a55d1", outlineColor: "info" } },
  },
};

export { Accordion };
