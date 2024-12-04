import { useEffect, useState } from 'react';
import { fetchUsers, fetchTasks, fetchHousehold, fetchMembers } from '../services/superbaseService';
import { IUser } from '../models/IUser';
import { ITask } from '../models/ITask';
import { IHousehold } from '../models/IHousehold';
import { IMembers } from '../models/IMembers';

interface OverviewProps {
  setHouseholdId: (id: string) => void;
}

export const Overview = ({ setHouseholdId } : OverviewProps) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]); 
  const [household, setHousehold] = useState<IHousehold[] | null>(null);
  const [members, setMembers] = useState<IMembers[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);

        const tasksData = await fetchTasks();
        setTasks(tasksData);

        if (usersData.length > 0) {
          const householdData = await fetchHousehold(usersData[0].user_id);
          setHousehold(householdData || null);

          if (householdData && householdData[0]?.household_id) {
            setHouseholdId(householdData[0].household_id); 
            const membersData = await fetchMembers(householdData[0].household_id);
            setMembers(membersData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [setHouseholdId]);

  return (

    <div>
      <h1>Overview</h1>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.user_id}>{user.username}</li>
        ))}
      </ul>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.task_id}>{task.name}</li>
        ))}
      </ul>
      <h2>Household</h2>
      <p>{household ? `Hushåll: ${household[0]?.name}` : 'No household found'}</p>
      <h2>Members</h2>
      <ul>
        {members.map((member) => (
          <li key={member.user_id}>Member ID: {member.user_id}</li>
        ))}
      </ul>
    </div>
  );
};
