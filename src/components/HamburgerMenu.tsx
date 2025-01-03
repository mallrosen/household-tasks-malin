import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

interface HamburgerMenuProps {
  householdId: string | null;
  memberId: string | null;
  handleLogout: () => void;
}

export const HamburgerMenu = ({ householdId, memberId, handleLogout }: HamburgerMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="hamburger-menu" ref={menuRef}>
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