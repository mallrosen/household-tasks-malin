import { useEffect, useState } from 'react';
import { fetchTotalPoints } from '../services/superbaseService';


export const FullReport = ({ householdId }: { householdId: string }) => {
  const [totalPoints, setTotalPoints] = useState<
    { username: string; totalPoints: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const points = await fetchTotalPoints(householdId);
      setTotalPoints(points);
    };

    fetchData();
  }, [householdId]);

  return (
    <div>
      <h2>Total Points</h2>
      <ul>
        {totalPoints.map((user) => (
          <li key={user.username}>
            {user.username}: {user.totalPoints} points
          </li>
        ))}
      </ul>
    </div>
  );
};
