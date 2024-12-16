import './styles/main.scss';
import './App.scss'
import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { AuthProvider } from './context/AuthContext';

function App() {

  return <>
  <AuthProvider>
  <RouterProvider router={router}></RouterProvider>
  </AuthProvider>
  </>;
}

export default App;