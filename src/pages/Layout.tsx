import { NavLink, Outlet } from "react-router-dom";
import { useParams } from 'react-router-dom';

export const Layout = () => {
  const { householdId } = useParams<{ householdId: string }>();

  return (
    <>
      <header>
        <nav>
          <ul>
            <li><NavLink to="/">Hem</NavLink></li>
         
              <li><NavLink to={`/tasks/${householdId}`}>Tasks</NavLink></li>
            
          </ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};
