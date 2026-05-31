import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Replace with your actual copied Client ID string */}
    <GoogleOAuthProvider clientId="6416725908-qcgfkhsjq8n02h08ev5h611sjoqeaba3.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);
