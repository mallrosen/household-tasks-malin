import { NavLink, Outlet } from "react-router-dom";

export const Layout = () => {
  return (
  <>
  <header>
    <nav>
      <ul>
        <li><NavLink to={"/"}>Hem</NavLink></li>
        <li><NavLink to={"/tasks"}>Tasks</NavLink></li>
      </ul>
    </nav>
  </header>
  <main>
    <Outlet/>
  </main>
  </>
  )  
};
