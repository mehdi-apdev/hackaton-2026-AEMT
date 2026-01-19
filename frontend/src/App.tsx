import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NotFoundComponent from "./core/components/NotFoundComponent";

import { systemRoutes } from "./features/system/system-routes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* system routes */}
        <Route path="ping" element={systemRoutes[0].element} />
        <Route path="markdown" element={systemRoutes[1].element} />

        <Route path="*" element={<NotFoundComponent />} />
      </Route>
    </Routes>
  );
}

export default App;
