import React from "react";
import { ErrlEditor } from "./components/ErrlEditor";
import { Viewer } from "./viewer/Viewer";
import { loadSharedScene } from "./share/sharedScenes";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { createBlankScene } from "./templates/manifest";
import { TemplateGrid } from "./components/TemplateGrid";
import { ThemeProvider } from "@errl-design-system";

const router = createBrowserRouter([
  {
    path: "/",
    element: <TemplateGrid />,
  },
  {
    path: "/editor",
    element: <ErrlEditor />,
  },
  {
    path: "/view/:shareId",
    loader: async ({ params }) => {
      if (!params.shareId) return null;
      const shared = await loadSharedScene(params.shareId);
      return shared?.scene || createBlankScene();
    },
    element: <Viewer />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export const AppRouter: React.FC = () => (
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);
