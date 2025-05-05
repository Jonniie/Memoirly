import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

// Get the publishable key from the environment variable
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'MISSING_CLERK_KEY';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <App />
      </Router>
    </ClerkProvider>
  </StrictMode>
);