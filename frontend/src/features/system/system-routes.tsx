import { Route } from "react-router-dom";
import PingTest from "./components/PingTest";
import MarkdownPage from "./components/MarkdownPage";

export default [
  <Route path="ping" key="ping" element={<PingTest />} />,
  <Route path="markdown" key="markdown" element={<MarkdownPage />} />,
];

