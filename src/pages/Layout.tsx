import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getSession } from '../services/superbaseService';
import { supabase } from '../services/supabaseClient';


export const Layout = () => {
  const [householdId, setHouseholdId] = useState<string | null>('');
  const [memberId, setMemberId] = useState<string | null>('');

  useEffect(() => {
    const fetchMemberInfo = async () => {
      const session = await getSession();
      const userId = session?.user?.id;

      if (!userId) return;

      const { data: householdData, error: householdError } = await supabase
        .from('Members')
        .select('household_id, member_id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (householdError || !householdData) {
        console.error('Error fetching household:', householdError);
        return;
      }

      setHouseholdId(householdData.household_id);
      setMemberId(householdData.member_id);
    };

    fetchMemberInfo();
  }, []);

  return (
    <>
      <header>
        <nav>
          <ul>
            <li><NavLink to="/">Hem</NavLink></li>
         
              <li><NavLink to={`/tasks/${householdId}/${memberId}`}>Tasks</NavLink></li>
              <li><NavLink to={`/dashboard`}>Dashboard</NavLink></li>
              <li><NavLink to={`/household/:householdId/:memberId`}>Household Page</NavLink></li>
</ul>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};
