import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const MIN_LOADER_MS = 1800;

function hidePageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader || loader.classList.contains('is-done')) return;

  const remaining = Math.max(0, MIN_LOADER_MS - performance.now());

  window.setTimeout(() => {
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    window.setTimeout(() => loader.remove(), 600);
  }, remaining);
}

function Root() {
  useEffect(() => {
    hidePageLoader();
  }, []);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);

window.setTimeout(hidePageLoader, 8000);
