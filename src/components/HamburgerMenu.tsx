import { useState } from "react";
import { NavLink } from "react-router-dom";

interface HamburgerMenuProps {
  householdId: string | null;
  memberId: string | null;
  handleLogout: () => void;
}

export const HamburgerMenu = ({ householdId, memberId, handleLogout }: HamburgerMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="hamburger-menu">
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <nav className={`menu ${menuOpen ? "open" : ""}`}>
        <ul>
          {householdId && memberId && (
            <>
              <li>
                <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to={`/tasks/${householdId}/${memberId}`} onClick={() => setMenuOpen(false)}>
                  Tasks
                </NavLink>
              </li>
              <li>
                <NavLink to={`/household/${householdId}`} onClick={() => setMenuOpen(false)}>
                  Household
                </NavLink>
              </li>
              <li>
                <NavLink to={`/game/${householdId}`} onClick={() => setMenuOpen(false)}>
                  Game
                </NavLink>
              </li>
            </>
          )}
          <li>
            <NavLink to="/" onClick={() => { handleLogout(); setMenuOpen(false); }}>
              Logga ut
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

