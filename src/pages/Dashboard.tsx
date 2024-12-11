import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateHouseholdForm } from '../components/CreateHousehold';
import { Overview } from './Overview';
import { getSession, fetchHousehold } from '../services/superbaseService';
import { supabase } from '../services/supabaseClient';
import { JoinHouseholdForm } from '../components/JoinHousehold';

export const Dashboard = () => {
  const [householdName, setHouseholdName] = useState('');
  const [householdId, setHouseholdId] = useState<string | null>('');
  const [householdCreated, setHouseholdCreated] = useState(false);
  const [memberId, setMemberId] = useState<string | null>('');
  const [userId, setUserId] = useState<string | null>('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          setHouseholdId(householdData[0].household_id);
          setHouseholdName(householdData[0].name);
          setHouseholdCreated(true);

          const { data, error } = await supabase
            .from('Members')
            .select('member_id')
            .eq('user_id', currentUserId)
            .eq('household_id', householdData[0].household_id)
            .single();

          if (error || !data) {
            setError('Error fetching member info: ' + (error?.message || 'Unknown error'));
          } else {
            setMemberId(data.member_id);
          }
        } else {
          setHouseholdId('');
          setHouseholdCreated(false);
          setHouseholdName('');
        }
      } catch (error) {
        setError('Error initializing dashboard: ' + error);
      }
    };
    const navigateToTasks = () => {
      if (householdId && memberId) {
        navigate(`/tasks/${householdId}/${memberId}`);
      } else {
        setError('Household ID or Member ID is missing.');
      }
      navigateToTasks();
    };

    initializeDashboard();
  }, []);



  const createHousehold = async (name: string) => {
    try {
      if (!userId) {
        setError('You must be logged in to create a household.');
        return;
      }
  
      const { data: householdData, error } = await supabase
        .from('Household')
        .insert([{ name, created_by: userId }])
        .select();
  
      console.log('Household creation response:', householdData); 
      if (error || !householdData) {
        setError('Error creating household: ' + error?.message);
        return;
      }
  

  
      const { error: memberError } = await supabase
        .from('Members')
        .insert([{ user_id: userId, household_id: householdId, role: 'admin' }]);
  
      if (memberError) {
        setError('Error adding user to household: ' + memberError.message);
        return;
      }
  
      setHouseholdId(householdId); 
      setHouseholdName(name); 
      setHouseholdCreated(true); 
      navigate(`/household/${householdId}`); 
    } catch (error) {
      setError('Error creating household: ' + error);
    }
  };
  

  const joinHousehold = async (householdName: string) => {
    try {
      if (!userId) {
        setError('You must be logged in to join a household.');
        return;
      }
  

      const { data: householdData, error: fetchError } = await supabase
        .from('Household')
        .select('household_id')
        .eq('name', householdName)
        .limit(1)
        .single(); 
  
      if (fetchError || !householdData) {
        setError('Household not found.');
        return;
      }
  
      const householdId = householdData.household_id;
  
      const { error: memberError } = await supabase
        .from('Members')
        .insert([{ user_id: userId, household_id: householdId, role: 'member' }]);
  
      if (memberError) {
        setError('Error joining household: ' + memberError.message);
        return;
      }
  
      navigate(`/household/${householdId}`);
    } catch (error) {
      setError('Error joining household: ' + error);
    }
  };  

  const navigateToTasks = () => {
    if (householdId && memberId) {
      navigate(`/tasks/${householdId}/${memberId}`);
    } else {
      setError('Household ID or Member ID is missing.');
    }
  }

  return (
    <div>
      <h2>Welcome to the Dashboard</h2>

      {!householdCreated && <CreateHouseholdForm onCreate={createHousehold} />}
      {!householdCreated && <JoinHouseholdForm onJoin={joinHousehold} />}
      {householdCreated && householdId && userId && (
        <Overview householdId={householdId} userId={userId} householdName={householdName} />
      )}

      {householdCreated && (
        <button onClick={navigateToTasks}>Go to Tasks</button>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
