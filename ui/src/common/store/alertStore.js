// store/userStore.ts
import { signal } from "@preact/signals-react";

// Global state
export const alerts = signal([]);

// Actions
export const setAlerts = (messages) => {
  alerts.value = messages;
};
