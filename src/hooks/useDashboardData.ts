import { useState, useEffect } from 'react';
import { fetchHousehold } from '../services/householdService';
import { getSession } from '../services/authService';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useDashboardData = () => {
  const { session, loading } = useAuth();
  const [householdName, setHouseholdName] = useState('');
  const [householdId, setHouseholdId] = useState<string | null>('');
  const [householdCreated, setHouseholdCreated] = useState(false);
  const [memberId, setMemberId] = useState<string | null>('');
  const [userId, setUserId] = useState<string | null>('');
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const session = await getSession();
        const currentUserId = session?.user?.id;

        if (!currentUserId) {
          setError('You must be logged in to see the dashboard');
          return;
        }

        setUserId(currentUserId);

        const householdData = await fetchHousehold(currentUserId);

        if (householdData && householdData.length > 0) {
          const fetchedHouseholdId = householdData[0].household_id;
          setHouseholdId(fetchedHouseholdId);
          setHouseholdName(householdData[0].name);
          setHouseholdCreated(true);

          const { data: memberData, error: memberError } = await supabase
            .from('Members')
            .select('member_id')
            .eq('user_id', currentUserId)
            .eq('household_id', fetchedHouseholdId)
            .single();

          if (memberError || !memberData) {
            setError('Error fetching member info: ' + (memberError?.message));
          } else {
            setMemberId(memberData.member_id);
          }
        } else {
          setHouseholdCreated(false);
          setHouseholdId(null);
          setHouseholdName('');
        }
      } catch (error) {
        setError('Error initializing dashboard: ' + (error as Error).message);
      }
    };

    initializeDashboard();
  }, [session, loading]);

  return {
    householdName,
    householdId,
    householdCreated,
    memberId,
    userId,
    error,
    setHouseholdId,
    setHouseholdName,
    setHouseholdCreated,
    setError,
  };
};