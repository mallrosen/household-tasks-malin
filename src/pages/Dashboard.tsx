import { useNavigate } from 'react-router-dom';
import { CreateHouseholdForm } from '../components/CreateHousehold';
import { Overview } from '../components/Overview';
import { JoinHouseholdForm } from '../components/JoinHousehold';
import { useDashboardData } from '../hooks/useDashboardData';
import { useUsername } from '../hooks/useUsername';
import "../styles/main.scss";
import { supabase } from '../services/supabaseClient';

export const Dashboard = () => {
  const {
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
  } = useDashboardData();

  const username = useUsername(userId);
  const navigate = useNavigate();

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

      if (error || !householdData || householdData.length === 0) {
        setError('Error creating household: ' + error?.message);
        return;
      }

      const householdId = householdData[0].household_id;
      setHouseholdId(householdId);
      setHouseholdName(name);

      const { error: memberError } = await supabase
        .from('Members')
        .insert([{ user_id: userId, household_id: householdId, role: 'admin' }]);
      if (memberError) {
        setError('Error adding user to household: ' + memberError.message);
        return;
      }
      setHouseholdCreated(true);
    } catch (error) {
      setError('Error creating household: ' + (error as Error).message);
    }
    window.location.reload();
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

      setHouseholdId(householdId);
      setHouseholdCreated(true);

    } catch (error) {
      setError('Error joining household: ' + (error as Error).message);
    }
    window.location.reload();
  };

  const navigateToTasks = () => {
    if (householdId && memberId) {
      navigate(`/tasks/${householdId}/${memberId}`);
    } else {
      setError('Household ID or Member ID is missing.');
    }
  };

  return (
    <div className='dashboardDiv'>
      <h2>Welcome {username && username[0].toUpperCase() + username.slice(1)}</h2>

      {!householdCreated && <CreateHouseholdForm onCreate={createHousehold} />}
      {!householdCreated && <JoinHouseholdForm onJoin={joinHousehold} />}
      {householdCreated && householdId && userId && (
        <Overview householdId={householdId} userId={userId} navigateToTasks={navigateToTasks} />
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};