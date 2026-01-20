import { useRoutes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NotFoundComponent from "./core/components/NotFoundComponent";

import { systemRoutes } from "./features/system/system-routes";
import NotesPage from "./features/notes/pages/NotesPage";

export default function App() {
  const element = useRoutes([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        // feature "system"
        ...systemRoutes,

        // feature "notes"
        { path: "notes", element: <NotesPage /> },
        { path: "note/:id", element: <NotesPage /> },

        // 404 (toujours en dernier)
        { path: "*", element: <NotFoundComponent /> },
      ],
    },
  ]);

  return element;
}
