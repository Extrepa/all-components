import React from 'react';
import ReactDOM from 'react-dom/client';
import { Landing } from './landing';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Landing />
    </ErrorBoundary>
  </React.StrictMode>,
);
