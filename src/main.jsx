import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

// Get the publishable key from the environment variable
const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "MISSING_CLERK_KEY";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </Router>
    </ClerkProvider>
  </StrictMode>
);
