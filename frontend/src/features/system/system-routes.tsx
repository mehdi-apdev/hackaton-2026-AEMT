import { Route } from "react-router-dom";
import PingTest from "./components/PingTest";
import MarkdownPage from "../notes/components/MarkdownPage";
import NotFoundComponent from "../../core/components/NotFoundComponent";
import NotesPage from "../notes/pages/NotesPage";
import LoginPage from "../auth/pages/LoginPage";

// Le chemin est relatif au layout dans lequel ces routes seront imbriquées.
// Si le layout est à la racine "/", alors ce chemin sera bien "/ping".
export default [
  <Route path="/login" element={<LoginPage />} key="login" />,
  <Route path="note/:id" element={<NotesPage />} key="note-detail" />,
  <Route path="ping" element={<PingTest />} key="ping" />,
  <Route path="markdown" element={<MarkdownPage />} key="markdown" />,
  <Route path="*" element={<NotFoundComponent />} key="not-found" />,
  
];

