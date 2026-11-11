import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { LangProvider } from "./lib/i18n";
import { CaseProvider } from "./lib/caseStore";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LangProvider>
        <CaseProvider>
          <App />
        </CaseProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
);
