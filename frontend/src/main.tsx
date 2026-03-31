/**
 * main.tsx - Application Entry Point
 * Renders the root React component and sets up providers
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './assets/styles/colors.css'       // 1. Color variables (CSS custom properties)
import './assets/fonts/fonts.css'         // 2. Font definitions (@font-face)
import './assets/styles/global.css'       // 3. Global reset and base styles
import './assets/styles/mobile.css'       // 4. Mobile-specific fixes

import App from './App.tsx'
import { AuthProvider } from './features/auth/context/AuthContext.tsx' 
import { ModalProvider } from './shared/context/ModalContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <>
            <App />
          </>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
