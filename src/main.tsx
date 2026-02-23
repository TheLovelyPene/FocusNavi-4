import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Emergency error logging for blank page debugging
window.onerror = (message, source, lineno, colno, error) => {
  const msg = document.createElement('div');
  msg.style.cssText = 'position:fixed;top:0;left:0;background:red;color:white;padding:20px;z-index:99999;font-family:monospace;white-space:pre-wrap;';
  msg.textContent = `FATAL ERROR: ${message}\nAt: ${source}:${lineno}:${colno}\nStack: ${error?.stack}`;
  document.body.appendChild(msg);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
