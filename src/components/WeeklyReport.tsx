import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { getMembersAndPoints, getParticipants } from '../services/superbaseService';

interface IUser {
  user_id: string;
  username: string | undefined;
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

export const WeeklyReport = () => {
  const [members, setMembers] = useState<IMembers[]>([]);
  const [isCompetitionActive, setIsCompetitionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [winner, setWinner] = useState<IMembers | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const { household, loading } = useAuth();
  const householdId = household ? household[0]?.household_id : null;

  let currentTimer: ReturnType<typeof setInterval> | null = null;

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
        setTimeRemaining(`${seconds}s`);
      }
    }, 1000);
  };

  const determineWinner = async () => {
    if (!householdId) return;

    const { data, error } = await supabase
      .rpc('get_top_participant', { _household_id: householdId });

    if (error || !data?.[0]) {
      console.error("Error determining winner:", error);
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
    setShowWinner(true);
    setWinner(winnerData);
    setShowWinner(true);
    saveWinner(winnerData);
    await supabase
      .from('WeeklyCompetition')
      .update({ is_active: false })
      .eq('household_id', householdId)
      .eq('is_active', true);

    await resetMemberPoints(members);
    setIsCompetitionActive(false);
  };
  const saveWinner = (winnerData: IMembers) => {
    localStorage.setItem('winner', JSON.stringify(winnerData));
    localStorage.setItem('showWinner', 'true');
  };
  const resetMemberPoints = async (members: IMembers[]): Promise<void> => {
    const resetPromises = members.map(async (member) => {
      try {
        const { error } = await supabase
          .from('Users')
          .update({ weekly_points: 0 })
          .eq('user_id', member.user_id);

        if (error) {
          console.error('Error resetting points for user:', member.user_id, error);
          return { success: false, user_id: member.user_id, message: error.message };
        }
        return { success: true, user_id: member.user_id };
      } catch (error) {
        console.error('Error resetting points:', error);
        return { success: false, user_id: member.user_id, message: (error as Error).message };
      }
    });

    await Promise.all(resetPromises);
  };

  const startWeeklyCompetition = async (householdId: string) => {
    await resetMemberPoints(members);
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + 1 * 60 * 1000).toISOString();

    try {
      const { data: members, error: membersError } = await supabase
        .from('Members')
        .select('member_id, user_id')
        .eq('household_id', householdId);

      if (membersError || !members?.length) throw new Error('No members found');

      const participantIds = members.map(member => member.user_id);

      await supabase
        .from('WeeklyCompetition')
        .insert([{
          start_time: startTime,
          end_time: endTime,
          is_active: true,
          household_id: householdId,
          participant_ids: participantIds,
        }]);

      setIsCompetitionActive(true);
      startTimer(new Date(endTime));
      
      const participantsData = await getParticipants(householdId);
      setParticipants(participantsData || []);
    } catch (error) {
      console.error('Error starting competition:', error);
    }
  };

  const resetFunction = () => {
    setShowWinner(false);
    setWinner(null);
    localStorage.removeItem('winner');
    localStorage.removeItem('showWinner');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!loading && householdId) {
        try {
          setIsLoading(true);
          const activeCompetition = await checkActiveCompetition(householdId);
          
          if (activeCompetition) {
            setIsCompetitionActive(true);
            startTimer(new Date(activeCompetition.end_time));
          }
          
          const [participantsData, membersData] = await Promise.all([
            getParticipants(householdId),
            getMembersAndPoints(householdId)
          ]);
          
          setParticipants(participantsData || []);
          setMembers(membersData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const savedWinner = localStorage.getItem('winner');
    const savedShowWinner = localStorage.getItem('showWinner');
    
    if (savedWinner && savedShowWinner === 'true') {
      setWinner(JSON.parse(savedWinner));
      setShowWinner(true);
    }

    fetchData();
  }, [householdId, loading]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Weekly Competition</h2>
      {!isCompetitionActive && (
        <button onClick={() => householdId && startWeeklyCompetition(householdId)}>
          Start Weekly Competition
        </button>
      )}
      {isCompetitionActive && <p>Time Remaining: {timeRemaining}</p>}
      <div>
        {isCompetitionActive && (
          <div>
            <h3>Current Standings</h3>
            {participants.map((participant) => (
              <div key={participant.username} className="flex justify-between p-2 border-b">
                <span>{participant.username}</span>
                <span>{participant.weekly_points || 0} points</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {winner && showWinner && (
        <div>
          <h2>Competition Winner</h2>
          <Trophy size={40} />
          <h3>Winner of the Week!</h3>
          <p>{winner.username}</p>
          <p>{winner.weekly_points} points</p>
          <button onClick={resetFunction}>Hide Winner</button>
        </div>
      )}
    </div>
  );
};