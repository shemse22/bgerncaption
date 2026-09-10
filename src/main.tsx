import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ClerkAuthProvider } from './components/ClerkAuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkAuthProvider>
        <App />
      </ClerkAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);