import { useEffect, useState } from 'react';
import { fetchTasks, fetchHousehold, fetchMembers, fetchUsers } from '../services/superbaseService';
import { ITask } from '../models/ITask';
import { IHousehold } from '../models/IHousehold';
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';

interface OverviewProps {
  householdId: string;
  userId: string;
  householdName: string;
}

export const Overview = ({ householdId, userId }: OverviewProps) => {
  const [users, setUsers] = useState<IUser[]>([]); 
  const [tasks, setTasks] = useState<ITask[]>([]); 
  const [household, setHousehold] = useState<IHousehold | null>(null);
  const [members, setMembers] = useState<IMembers[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);

        const householdData = await fetchHousehold(userId);
        setHousehold(householdData ? householdData[0] : null);

        const membersData = await fetchMembers(householdId);
        setMembers(membersData);

        const tasksData = await fetchTasks(householdId);
        setTasks(tasksData || []);

        const user = usersData.find((user) => user.user_id === userId);
        if (user) {
          setUserPoints(user.total_points); 
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [householdId, userId]); 

  const householdUsers = users.filter(user => 
    members.some(member => member.user_id === user.user_id)
  );

  const filteredTasks = tasks.filter(() =>
    members.some(member => member.user_id === userId)
  );

  return (
    <div>
      <h1>Overview</h1>

      <h2>Household</h2>
      <p>{household ? `${household.name}` : 'No household found'}</p>

      <h2>Your Points</h2>
      <p>{userPoints !== null ? `Your points: ${userPoints}` : 'Points not found'}</p>

      <h2>Household members</h2>
      <ul>
        {householdUsers.map(user => (
          <li key={user.user_id}>{user.username}</li>
        ))}
      </ul>

      <h2>Tasks</h2>
      <ul>
        {filteredTasks.map(task => (
          <li key={task.task_id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
};
