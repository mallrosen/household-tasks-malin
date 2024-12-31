import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface CompetitionManagerProps {
  householdId: string | null;
  participants: { participant_id: string; username: string; weekly_points: number }[];
}

export const CompetitionManager = ({ householdId, participants }: CompetitionManagerProps) => {
  const [winner, setWinner] = useState<
    { username: string; weekly_points: number }[] | null
  >(null);

  const endCompetition = async () => {
    if (!householdId) {
      console.error('Household ID is required.');
      return;
    }

    const topParticipant = participants.reduce((prev, curr) =>
      curr.weekly_points > prev.weekly_points ? curr : prev,
      participants[0]
    );

    if (!topParticipant) {
      console.error('No participants found.');
      return;
    }

    const { data, error } = await supabase
      .from('WeeklyCompetition')
      .update({
        winners: supabase.rpc('array_append', {
          column: 'winners',
          value: topParticipant.participant_id,
        }),
      })
      .eq('household_id', householdId)
      .eq('is_active', true);

    if (error) {
      console.error('Error updating WeeklyCompetition:', error.message);
      return;
    }

    fetchWinners();
  };

  const fetchWinners = async () => {
    if (!householdId) {
      console.error('Household ID is required.');
      return;
    }

    const { data, error } = await supabase
      .from('WeeklyCompetition')
      .select('winners')
      .eq('household_id', householdId)
      .eq('is_active', false);

    if (error) {
      console.error('Error fetching winners:', error.message);
      return;
    }

    if (data && data[0]?.winners) {
      const winnerIds = data[0].winners;

      const { data: participantsData, error: participantsError } = await supabase
        .from('Participants')
        .select('username, weekly_points')
        .in('participant_id', winnerIds);

      if (participantsError) {
        console.error('Error fetching participant details:', participantsError.message);
        return;
      }

      setWinner(participantsData);
    } else {
      console.log('No winners found for this competition.');
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [householdId]);

  return (
    <div>
      {winner && (
        <div>
          <h2>Competition Winners</h2>
          {winner.map((win) => (
            <div key={win.username}>
              <p>{win.username}</p>
              <p>{win.weekly_points} points</p>
            </div>
          ))}
        </div>
      )}
      <button onClick={endCompetition}>End Competition</button>
    </div>
  );
};
