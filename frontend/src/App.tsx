import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { HomeComponent } from "./HomeComponent";
import NotFoundComponent from "./core/components/NotFoundComponent";

// --- Auth Imports ---
import RequireAuth from "./features/auth/components/RequireAuth";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage"; 

// --- Features Imports ---
import NotesPage from "./features/notes/pages/NotesPage";
import systemRoutes from "./features/system/system-routes";
import SpookyCursor from "./shared/components/SpookyCursor";

function App() {
  return (
    <>
      <SpookyCursor />
      <Routes>
        {/* --- 1. Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- 2. Protected Routes (Guard) --- */}
        <Route element={<RequireAuth />}>
          {/* Main Layout (Sidebar + Content) */}
          <Route path="/" element={<MainLayout />}>
            {/* Default Home Page */}
            <Route index element={<HomeComponent />} />

            {/* Notes Feature */}
            <Route path="notes" element={<NotesPage />} />
            <Route path="note/:id" element={<NotesPage />} />

            {/* System Feature: Mapping the array to dynamically create <Route> */}
            {systemRoutes.map((route) => (
              <Route 
                key={route.path}
                path={route.path} 
                element={route.element} 
              />
            ))}

            <Route path="*" element={<NotFoundComponent />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;