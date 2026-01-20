import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { HomeComponent } from "./HomeComponent";
import NotFoundComponent from "./core/components/NotFoundComponent";

// --- Imports Auth ---
import RequireAuth from "./features/auth/components/RequireAuth";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage"; 

// --- Imports Features ---
import NotesPage from "./features/notes/pages/NotesPage";
import systemRoutes from "./features/system/system-routes";

function App() {
  return (
    <Routes>
      {/* --- 1. Routes Publiques --- */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- 2. Routes Protégées (Gardien) --- */}
      <Route element={<RequireAuth />}>
        
        {/* Le Layout Principal (Sidebar + Contenu) */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Page d'accueil par défaut */}
          <Route index element={<HomeComponent />} />

          {/* Feature Notes */}
          <Route path="notes" element={<NotesPage />} />
          <Route path="note/:id" element={<NotesPage />} />

          {/* Feature System : On "mappe" le tableau pour créer des <Route> dynamiquement */}
          {systemRoutes.map((route) => (
            <Route 
              key={route.path} // La clé est obligatoire dans une boucle
              path={route.path} 
              element={route.element} 
            />
          ))}

          {/* 404 - Doit toujours être en dernier à l'intérieur du Layout */}
          <Route path="*" element={<NotFoundComponent />} />
          
        </Route>
      </Route>
    </Routes>
  );
}

export default App;