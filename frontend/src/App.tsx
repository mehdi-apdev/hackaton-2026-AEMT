import { Route, Routes } from "react-router-dom";
import systemRoutes from "./features/system/system-routes";
import { HomeComponent } from "./HomeComponent";
import MainLayout from "./layout/MainLayout";
import NotFoundComponent from "./core/components/NotFoundComponent";

// Imports Auth & Notes
import RequireAuth from "./features/auth/components/RequireAuth";
import LoginPage from "./features/auth/pages/LoginPage";
import NotesPage from "./features/notes/pages/NotesPage";


function App() {
  return (
    <Routes>
      {/* --- 1. Route Publique --- */}
      <Route path="/login" element={<LoginPage />} />

      {/* --- 2. Routes Protégées (Gardien) --- */}
      <Route element={<RequireAuth />}>
        
        {/* Le Layout Principal (Sidebar + Contenu) */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Page d'accueil */}
          <Route index element={<HomeComponent />} />

          {/* Gestion des Notes */}
          <Route path="notes" element={<NotesPage />} />
          <Route path="note/:id" element={<NotesPage />} />

          {/* Routes Système (Mappées dynamiquement car c'est un tableau) */}
          {systemRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={route.element} 
            />
          ))}

          {/* 404 - Doit être en dernier à l'intérieur du Layout */}
          <Route path="*" element={<NotFoundComponent />} />
          
        </Route>
      </Route>
    </Routes>
  );
}

export default App;