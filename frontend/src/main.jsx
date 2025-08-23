import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// ✅ Import font here
import '@fontsource/inter';

// Import global CSS
import './index.css'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
