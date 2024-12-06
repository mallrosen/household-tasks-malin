import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateHouseholdForm } from '../components/CreateHousehold';
import { Overview } from './Overview';
import { getSession, fetchHousehold, fetchMembers } from '../services/superbaseService';
import { supabase } from '../supabaseClient';
import { JoinHouseholdForm } from '../components/JoinHousehold';

export const Dashboard = () => {
  const [householdName, setHouseholdName] = useState('');
  const [existingHouseholdId, setExistingHouseholdId] = useState('');
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

      if (error || !householdData) {
        setError('Error creating household: ' + error);
        return;
      }

      const newHouseholdId = householdData[0].household_id;

      const { error: memberError } = await supabase
        .from('Members')
        .insert([{ user_id: userId, household_id: householdId, role: 'admin' }]);

      if (memberError) {
        setError('Error adding user to household: ' + error);
        return;
      }

      navigate(`/household/${householdId}`);
    } catch (err) {
      setError('Error creating household: ' + error);
    }
  };

  const joinHousehold = async () => {
    try {
      if (!existingHouseholdId) {
        setError('Please provide a valid household ID.');
        return;
      }

      const members = await fetchMembers(existingHouseholdId);

      if (!members || members.length === 0) {
        setError('No such household found.');
        return;
      }

      const { error } = await supabase
        .from('Members')
        .insert([{ user_id: userId, household_id: existingHouseholdId, role: 'member' }]);

      if (error) {
        setError('Error joining household: ' + error);
        return;
      }

      navigate(`/household/${existingHouseholdId}`);
    } catch (err) {
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
