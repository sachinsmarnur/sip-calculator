import { ThemeProvider } from "next-themes";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

import { CurrencyProvider } from "./hooks/useCurrency";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <CurrencyProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <App />
    </ThemeProvider>
  </CurrencyProvider>
);
