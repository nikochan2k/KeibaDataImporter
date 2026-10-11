import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import { ImportStatusProvider } from "./ImportStatus";

const root = document.getElementById("root");
if (!root) {
  throw new Error("#root がありません");
}
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ImportStatusProvider>
        <App />
      </ImportStatusProvider>
    </BrowserRouter>
  </StrictMode>,
);
