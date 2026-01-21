import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// --- CSS Imports (Order matters!) ---
import './assets/colors.css'       // 1. Variables de couleurs
import './assets/fonts/fonts.css'  // 2. Polices
import './global.css'              // 3. Reset et styles globaux
import './mobile.css'              // 4. Correctifs Mobile

import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext.tsx' 
import { ModalProvider } from './shared/context/ModalContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
