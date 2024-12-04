import { createBrowserRouter } from "react-router-dom";
import { Overview } from "./pages/Overview";
import { Layout } from "./pages/Layout";
import { NotFound } from "./pages/NotFound";
import { Tasks } from "./pages/Tasks";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
            <Overview
                setHouseholdId={(id) => {
                console.log(id);    
            }}
          />
        ),
      },
      {
        path: '/tasks/:householdId',
        element: <Tasks tasks={[]} />,
      },

    ],
    errorElement: <NotFound />,
  },
]);
