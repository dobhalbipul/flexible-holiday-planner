import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CurrencyProvider } from "./lib/currency";

createRoot(document.getElementById("root")!).render(
  <CurrencyProvider>
    <App />
  </CurrencyProvider>
);
