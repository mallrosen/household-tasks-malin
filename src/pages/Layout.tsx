import { ReactNode, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getSession } from '../services/superbaseService';
import { supabase } from '../services/supabaseClient';
import "../styles/main.scss";
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { session, loading } = useAuth();


  useEffect(() => {
    if (!loading) {
      setIsLoggedIn(!!session);  
    }
    const fetchMemberInfo = async () => {
      const session = await getSession();
      if (!session) {
        setIsLoggedIn(false);
        return;
      }
  
      const { data: memberData, error: memberError } = await supabase
        .from('Members')
        .select('household_id, member_id')
        .eq('user_id', session.user?.id)
        .limit(1);  
  

      if (memberError) {
        console.error('Error fetching member info:', memberError.message);
        return;
      }

      if (!memberData || memberData.length === 0) {
        console.error('No member data found');
        return;
      }

      const { household_id, member_id } = memberData[0];  
      setHouseholdId(household_id); 
      setMemberId(member_id);  
      setIsLoggedIn(true);  
    };
  
    fetchMemberInfo();
  }, [session, loading]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  // if (loading) {
  //   return <div>Laddar...</div>;
  // }

  return (
    <>
      {session && isLoggedIn && (
        <nav>
          <ul>
            <li>
              <NavLink to={`/tasks/${householdId}/${memberId}`}>Tasks</NavLink>
            </li>
            <li>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </li>
            <li>
              <NavLink to={`/household/${householdId}`}>Household</NavLink>
            </li>
            <li>
              <NavLink to="/" onClick={handleLogout} className="logout-button">
                Logga ut
              </NavLink>
            </li>
          </ul>
        </nav>
      )}

      <Outlet />
      {children}
    </>
  );
};