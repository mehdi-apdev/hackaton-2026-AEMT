import PingTest from "./components/PingTest";
import MarkdownPage from "../notes/components/MarkdownPage";
import NotFoundComponent from "../../core/components/NotFoundComponent";
import NotesPage from "../notes/pages/NotesPage";
import LoginPage from "../auth/pages/LoginPage";

// Le chemin est relatif au layout dans lequel ces routes seront imbriquées.
// Si le layout est à la racine "/", alors ce chemin sera bien "/ping".
const systemRoutes = [
  { path: "ping", element: <PingTest /> },
  { path: "markdown", element: <MarkdownPage /> },
];

export default systemRoutes;