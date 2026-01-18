import { Route } from "react-router-dom";
import PingTest from "./components/PingTest";

// Le chemin est relatif au layout dans lequel ces routes seront imbriquées.
// Si le layout est à la racine "/", alors ce chemin sera bien "/ping".
const systemRoutes = [
    <Route key="ping" path="/ping" element={<PingTest />} />
];

export default systemRoutes;