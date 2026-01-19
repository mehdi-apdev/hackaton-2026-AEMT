import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NotFoundComponent from "./core/components/NotFoundComponent";

import systemRoutes from "./features/system/system-routes";
import NotesPage from "./features/notes/pages/NotesPage";
import HomeComponent from "./HomeComponent";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Route d'accueil par défaut */}
        <Route index element={<HomeComponent />} />

        {/* feature "system" */}
        {systemRoutes}

        {/* feature "notes" */}
        <Route path="note/:id" element={<NotesPage />} />

        {/* 404 (toujours en dernier) */}
        <Route path="*" element={<NotFoundComponent />} />
      </Route>
    </Routes>
  );
}
