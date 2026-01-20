import { Route, Routes } from "react-router-dom";
import systemRoutes from "./features/system/system-routes";
import { HomeComponent } from "./HomeComponent";
import MainLayout from "./layout/MainLayout";

function App() {
  return (
    <Routes>      
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomeComponent />} />
        {systemRoutes}
      </Route>
    </Routes>
  );
}

export default App;
