import { createBrowserRouter } from "react-router-dom";
import { Overview } from "./pages/Overview";
import { Layout } from "./pages/Layout";
import { NotFound } from "./pages/NotFound";
import { Tasks } from "./pages/Tasks";
import { LogInForm } from "./components/LoginForm"; // Startsida för inloggning 
import { SignUpForm } from "./components/SignUpForm"; // Registreringssida
import { Dashboard } from "./pages/Dashboard"
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
        path: '/overview', 
        element: (
          <Overview householdId={""} userId={""} householdName={""}/>
        ),
      },
      {
        path: '/tasks/:householdId',
        element: <Tasks tasks={[]} />,
      },
      {
        path: '/household/:householdId',
        element: <HouseholdPage />
      }
    ],
    errorElement: <NotFound />,
  },
]);
