import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// --- CSS-Importe (Reihenfolge ist wichtig!) ---
import './assets/colors.css'       // 3. Reset and global styles
import './assets/fonts/fonts.css'  // 2. Fonts
import './global.css'              // 3. Reset and global styles

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