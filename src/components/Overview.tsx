import React, { useEffect, useState } from 'react';
import { fetchUsers, fetchTasks, fetchHousehold, fetchMembers } from '../services/superbaseService';
import { IUser } from '../models/IUser';
import { ITask } from '../models/ITask';
import { IHousehold } from '../models/IHousehold';
import { IMembers } from '../models/IMembers';

const Overview: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]); 
  const [household, setHousehold] = useState<IHousehold[] | null>(null);
  const [members, setMembers] = useState<IMembers[]>([]);

  useEffect(() => {
    async function fetchData() {
      const usersData = await fetchUsers();
      setUsers(usersData);

      const tasksData = await fetchTasks();
      setTasks(tasksData);

      const householdData = await fetchHousehold(usersData[0].id);
      setHousehold(householdData || null);

      if (householdData && householdData[0]?.id) {
        const membersData = await fetchMembers(householdData[0].id);
        setMembers(membersData || []);
      }
  
    }

    fetchData();
  }, []); // Kanske skapa bättre dependencyarray??

  return (
    <div>
      <h1>Overview</h1>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.name}</li>
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

export default Overview;
