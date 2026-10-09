import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import "./styles.css";

// Remove default context menu globally (except if we wanted to allow it in specific places,
// but React onContextMenu will still fire for the custom channel menu)
document.addEventListener("contextmenu", (e) => {
  // O menu customizado do React nos canais continuará funcionando
  // porque o onContextMenu do React é disparado de forma sintética.
  e.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
