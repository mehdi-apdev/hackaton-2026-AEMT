import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// --- CSS Imports (Order matters!) ---
import './assets/colors.css'       // 1. Variables de couleurs
import './assets/fonts/fonts.css'  // 2. Polices
import './global.css'              // 3. Reset et styles globaux

import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext.tsx' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)