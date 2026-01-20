import { Route } from "react-router-dom";
import PingTest from "./components/PingTest";
import MarkdownPage from "../notes/components/MarkdownPage";
import NotFoundComponent from "../../core/components/NotFoundComponent";
import NotesPage from "../notes/pages/NotesPage";
import LoginPage from "../auth/pages/LoginPage";
import RegisterPage from "../auth/pages/RegisterPage";

export default [
  <Route path="auth/login" element={<LoginPage />} key="login" />,
  <Route path="auth/register" element={<RegisterPage />} key="register" />,
  <Route path="note/:id" element={<NotesPage />} key="note-detail" />,
  <Route path="ping" element={<PingTest />} key="ping" />,
  <Route path="markdown" element={<MarkdownPage />} key="markdown" />,
  <Route path="*" element={<NotFoundComponent />} key="not-found" />,
];
