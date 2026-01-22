import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import NotFoundComponent from "./core/components/NotFoundComponent";

// --- Auth Imports ---
import RequireAuth from "./features/auth/components/RequireAuth";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage"; 

// --- Features Imports ---
import NotesPage from "./features/notes/pages/NotesPage";
import BinPage from "./features/notes/pages/BinPage";

function App() {
  return (
    <>
      <Routes>
        {/* --- 1. Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- 2. Protected Routes (Guard) --- */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} /> {/* Default Home Page */}

            <Route path="notes" element={<NotesPage />} />
            <Route path="note/:id" element={<NotesPage />} />
            <Route path="bin" element={<BinPage />} />
            <Route path="*" element={<NotFoundComponent />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
