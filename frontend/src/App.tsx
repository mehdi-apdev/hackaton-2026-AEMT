import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NotFoundComponent from "./core/components/NotFoundComponent";
import systemRoutes from "./features/system/system-routes";

function App() {
  return (
    <Routes>
      {/* Route principale avec le layout global */}
      <Route path="/" element={<MainLayout />}>
        
        {/* Les routes de la feature "system" sont injectées ici */}
        {systemRoutes}

        {/* Ajoutez d'autres features ici */}
        {/* {featureXYZRoutes} */}

        {/* La page 404 est la dernière route pour tout intercepter */}
        <Route path="*" element={<NotFoundComponent />} />
      </Route>
    </Routes>
  );
}

export default App;