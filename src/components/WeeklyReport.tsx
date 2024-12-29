import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { getParticipants } from '../services/superbaseService';

interface IUser {
  user_id: string;
  username: string;
  weekly_points: number;
  total_points: number;
}

interface IMembers {
  username: string;
  total_points: number;
  member_id: string;
  user_id: string;
  household_id: string;
  Users: IUser[] | null;
  weekly_points: number;
}

interface Participant {
  username: string;
  weekly_points: number;
}


const getMembersAndPoints = async (householdId: string): Promise<IMembers[]> => {
  try {
    const { data, error } = await supabase.rpc('get_members_and_points', { household_id: householdId });

    if (error) {
      console.error("Error fetching members:", error);
      return [];
    }

    return (data || []).map((member: IMembers) => ({
      member_id: member.member_id,
      user_id: member.user_id,
      username: member.username || 'Unknown User',
      total_points: member.total_points || 0,
      household_id: member.household_id,
      Users: member.Users ? member.Users.map((user: IUser) => ({
        user_id: user.user_id,
        username: user.username,
        weekly_points: user.weekly_points,
        total_points: user.total_points,
      })) : null,
    }));
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};


const checkActiveCompetition = async (householdId: string) => {
  const { data, error } = await supabase
    .from('WeeklyCompetition')
    .select('*')
    .eq('is_active', true)
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking competition:', error);
    return null;
  }

  return data?.[0] || null;
};

const resetMemberPoints = async (members: IMembers[]): Promise<void> => {
  const resetPromises = members.map(async (member) => {
    try {
      console.log(`Attempting to reset weekly points for user: ${member.user_id}`);
      const { data, error } = await supabase
        .from('Users')
        .update({ weekly_points: 0 })
        .eq('user_id', member.user_id);

      if (error) {
        console.error('Error resetting weekly_points for user:', member.user_id, error);
        return { success: false, user_id: member.user_id, message: error.message };
      } else {
        console.log('Weekly points reset for user:', member.user_id, data);
        return { success: true, user_id: member.user_id };
      }
    } catch (error) {
      console.error('Unexpected error resetting points for user:', member.user_id, error);
      return { success: false, user_id: member.user_id, message: (error as Error).message };
    }
  });

  try {
    const results = await Promise.all(resetPromises);

    results.forEach((result) => {
      if (!result.success) {
        console.error(`Failed to reset points for user: ${result.user_id}. Error: ${result.message}`);
      } else {
        console.log(`Points reset for user: ${result.user_id}`);
      }
    });

    console.log('All weekly points reset successfully.');
  } catch (error) {
    console.error('Error resetting weekly_points in Users table:', error);
  }
};

export const WeeklyReport = () => {
  const [members, setMembers] = useState<IMembers[]>([]);
  const [isCompetitionActive, setIsCompetitionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [winner, setWinner] = useState<IMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { household, loading } = useAuth();
  const householdId = household ? household[0]?.household_id : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!loading && householdId) {
        try {
          setIsLoading(true);

          const activeCompetition = await checkActiveCompetition(householdId);
          if (activeCompetition) {
            setIsCompetitionActive(true);
            startTimer(new Date(activeCompetition.end_time));
          } else {
            const membersData = await getMembersAndPoints(householdId);
            setMembers(membersData);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    

    fetchData();
  }, [loading, householdId]);

  let currentTimer: ReturnType<typeof setInterval> | null = null;

  const startTimer = (endTime: Date) => {
    if (currentTimer) clearInterval(currentTimer);
  
    currentTimer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;
  
      if (distance <= 0) {
        clearInterval(currentTimer!);
        currentTimer = null;
        determineWinner();
        setTimeRemaining('');
      } else {
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeRemaining(` ${seconds}s`);
      }
    }, 1000);
  };

  const determineWinner = async () => {
    if (!householdId) return;

    const { data, error } = await supabase
      .rpc('get_top_participant', { _household_id: householdId });

    if (error) {
      console.error('Error determining winner:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log("No winner found.");
      return;
    }
    const winnerData = data[0];

    setWinner({
      user_id: winnerData.user_id,
      username: winnerData.username || 'Unknown User',
      weekly_points: winnerData.weekly_points || 0,
      total_points: winnerData.total_points || 0,
      household_id: householdId,
      member_id: winnerData.member_id || 'Unknown Member ID',
      Users: winnerData.Users || null,
    });

    console.log("Winner determined:", winnerData);

    // Avsluta tävlingen
    await supabase
      .from('WeeklyCompetition')
      .update({ is_active: false })
      .eq('household_id', householdId)
      .eq('is_active', true);

    resetMemberPoints(members); // TITTA PÅ DENNA FUNKTIONEN - Fungerar inte som tänkt
    setIsCompetitionActive(false);
  };

  const startWeeklyCompetition = async (householdId: string) => {
    const startTime = new Date().toISOString(); 
    const endTime = new Date(Date.now() + 1 * 60 * 1000).toISOString(); 
    try {
      const { data: members, error: membersError } = await supabase
        .from('Members')
        .select('member_id, user_id')
        .eq('household_id', householdId);

      if (membersError) throw membersError;
      if (!members || members.length === 0) throw new Error('No members found in household');

      const participantIds = members.map((member) => member.user_id);

      const { error: competitionError } = await supabase
      
        .from('WeeklyCompetition')
        .insert([
          {
            start_time: startTime.toString(),
            end_time: endTime.toString(),
            is_active: true,
            household_id: householdId,
            participant_ids: participantIds,
          }, 
        ]); 
        setIsCompetitionActive(true);
      if (competitionError) throw competitionError;
      console.log('Weekly competition started successfully with participants:', participantIds);
    } catch (error) {
      console.error('Error starting competition:', error);
    }
    startTimer(new Date(endTime));
    
  };

  

  useEffect(() => {
    const fetchParticipants = async () => {
      if (householdId) {
        const participantsData = await getParticipants(householdId);
        setParticipants(participantsData || []);
        console.log('Participants:', participantsData); 
      }
    };
    fetchParticipants();
  }, [householdId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Weekly Competition</h2>
      {!isCompetitionActive && !winner && (
        <button onClick={() => householdId && startWeeklyCompetition(householdId)}>
          Start Weekly Competition
        </button>
      )}
      {isCompetitionActive && <p>Time Remaining: {timeRemaining}</p>}
      <div>

        {members.map((member) => (
          <div key={member.member_id}>
   
          </div>
        ))}
        {isCompetitionActive && (
          <div>
            {participants.map((participant) => (
              <div key={participant.username}>
                <span>{participant.username}</span>
                <span>{participant.weekly_points || 0} points</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {winner && (
        <div>
          <Trophy size={40} />
          <h3>Winner of the Week!</h3>
          <p>{winner.username}</p>
          <p>{winner.weekly_points} points</p>
        </div>
      )}
    </div>
  );
};
