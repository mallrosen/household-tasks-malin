import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { NotFound } from "./pages/NotFound";
import { Tasks } from "./pages/Tasks";
import { LogInForm } from "./pages/LogInForm"; 
import { SignUpForm } from "./pages/SignUpForm"; 
import { Dashboard } from "./pages/Dashboard";
import { HouseholdPage } from "./pages/HouseholdPage";


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/', 
        element: <LogInForm />,
      },
      {
        path: '/signup',
        element: <SignUpForm />,
      },
      {
        path: '/dashboard', 
        element: <Dashboard />,
      },
      {
        path: '/tasks/:householdId/:memberId', 
        element: <Tasks />,
      },
      {
        path: '/household/:householdId/', 
        element: <HouseholdPage />,
      },
    ],
    errorElement: <NotFound />,
  },
]);
