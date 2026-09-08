import { ClerkProvider } from '@clerk/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ClerkAuthProvider } from './components/ClerkAuthProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/">
<ClerkAuthProvider>
      <App />
    </ClerkAuthProvider>
</ClerkProvider>
  </StrictMode>,
);