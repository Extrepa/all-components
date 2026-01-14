import React from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "./routes";
import "./styles.css";
// Import unified design system CSS
import "@errl-design-system/styles/errlDesignSystem.css";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<AppRouter />);
}
