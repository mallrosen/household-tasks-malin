import { Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeeklyCompetition } from '../hooks/useWeeklyCompetition';
import '../styles/main.scss';

interface IParticipant {
  username: string;
  weekly_points: number;
}

export const WeeklyReport = () => {
  const { household } = useAuth();
  const householdId = household ? household[0]?.household_id : null;

  const {
    isCompetitionActive,
    timeRemaining,
    winner,
    showWinner,
    isLoading,
    participants,
    startWeeklyCompetition,
    endCompetition,
    restartCompetition,
    resetFunction,
  } = useWeeklyCompetition(householdId);

  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <div>
        {winner && showWinner && (
          <div className="winnerContainer">
            <div>
              <h2>Competition Winners</h2>
              <Trophy size={40} />
              <h3>Winners of the Week!</h3>
              {winner.map((win) => (
                <div key={win.user_id}>
                  <p>{win.username}</p>
                  <p>{win.weekly_points} points</p>
                </div>
              ))}
              <button onClick={resetFunction}>Hide Winners</button>
            </div>
          </div>
        )}
      </div>
      <div className="WeeklyGame">
        <h2>Weekly Competition</h2>
        {isCompetitionActive && <p>Time Remaining: {timeRemaining}</p>}
        <div>
          {isCompetitionActive && (
            <div>
              <h3>Players</h3>
              {participants.map((participant: IParticipant) => (
                <div key={participant.username}>
                  <span>{participant.username}</span>
                  <span>{participant.weekly_points || 0} points</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {!isCompetitionActive && (
          <button onClick={() => householdId && startWeeklyCompetition(householdId)}>
            Start Weekly Competition
          </button>
        )}
        {isCompetitionActive && (
          <>
            <button onClick={endCompetition}>End Competition</button>
            <button onClick={restartCompetition}>Restart Competition</button>
          </>
        )}
      </div>
    </>
  );
};