import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'

// Add error boundary for production
window.addEventListener('error', (e) => {
  // console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  // console.error('Unhandled promise rejection:', e.reason);
});

try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  // console.error('Failed to render app:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: monospace; color: #00ff41; background: #0a0a0a; min-height: 100vh;">
      <h1>Hacker Arena</h1>
      <p>Loading error. Please refresh the page.</p>
      <p>Error: ${error.message}</p>
    </div>
  `;
}
