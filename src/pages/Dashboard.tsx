import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateHouseholdForm } from '../components/CreateHousehold';
import { Overview } from './Overview';
import { getSession, fetchHousehold } from '../services/superbaseService';
import { supabase } from '../services/supabaseClient';
import { JoinHouseholdForm } from '../components/JoinHousehold';

export const Dashboard = () => {
  const [householdName, setHouseholdName] = useState('');
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [householdCreated, setHouseholdCreated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const session = await getSession();
        const currentUserId = session?.user?.id;

        if (!currentUserId) {
          setError('You must be logged in to se dashboard');
          return;
        }

        setUserId(currentUserId);

        const householdData = await fetchHousehold(currentUserId);
        console.log('Fetched household data:', householdData); 

        if (householdData && householdData.length > 0) {
          setHouseholdId(householdData[0].household_id);
          setHouseholdName(householdData[0].name);
          setHouseholdCreated(true);
        } else {
          setHouseholdId('');
          setHouseholdCreated(false);
          setHouseholdName('');
        }
      } catch (error) {
        setError('Error initializing dashboard: ' + error);
      }
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
  
      // Lägg till användaren i Members-tabellen
      const { error: memberError } = await supabase
        .from('Members')
        .insert([{ user_id: userId, household_id: householdId, role: 'member' }]);
  
      if (memberError) {
        setError('Error joining household: ' + memberError.message);
        return;
      }
  
      // Om det fungerar, navigera till hushållets sida
      navigate(`/household/${householdId}`);
    } catch (error) {
      setError('Error joining household: ' + error);
    }
  };
  

  return (
    <div>
      <h2>Welcome to the Dashboard</h2>

      {!householdCreated && <CreateHouseholdForm onCreate={createHousehold} />}

      {!householdCreated && ( <JoinHouseholdForm onJoin={joinHousehold} />  
      )}

      {householdCreated && householdId && userId && (
        <Overview householdId={householdId} userId={userId} householdName={householdName} />
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
