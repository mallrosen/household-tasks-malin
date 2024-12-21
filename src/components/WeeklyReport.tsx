import { useEffect, useState } from 'react';
import { fetchWeeklyPoints } from '../services/superbaseService';

export const WeeklyReport = ({ householdId }: { householdId: string }) => {
  const [weeklyPoints, setWeeklyPoints] = useState<
    { username: string; weeklyPoints: number }[]
  >([]);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const points = await fetchWeeklyPoints(householdId);
      setWeeklyPoints(points);

      if (points.length > 0) {
        const topUser = points.reduce((prev: { weeklyPoints: number; }, current: { weeklyPoints: number; }) =>
          prev.weeklyPoints > current.weeklyPoints ? prev : current
        );
        setWinner(topUser.username);
      }
    };

    fetchData();
  }, [householdId]);

  return (
    <div>
      <h2>Weekly Report</h2>
      <ul>
        {weeklyPoints.map((user) => (
          <li key={user.username}>
            {user.username}: {user.weeklyPoints} points
          </li>
        ))}
      </ul>
      {winner && <h3>Winner of the week: {winner} 🎉</h3>}
    </div>
  );
};
