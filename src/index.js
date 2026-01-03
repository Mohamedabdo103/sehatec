import React from "react";
import "./styles/main.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PatientProvider } from "./context/PatientContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <PatientProvider>
    <App />
  </PatientProvider>
);
