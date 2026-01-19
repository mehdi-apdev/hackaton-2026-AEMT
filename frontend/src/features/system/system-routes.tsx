import type { RouteObject } from "react-router-dom";
import PingTest from "./components/PingTest";
import MarkdownPage from "./components/MarkdownPage";

// Le chemin est relatif au layout dans lequel ces routes seront imbriquées.
// Si le layout est à la racine "/", alors ce chemin sera bien "/ping".
export const systemRoutes: RouteObject[] = [
  {
    path: "ping",
    element: <PingTest />,
  },
  {
    path: "markdown",
    element: <MarkdownPage />,
  },
];
