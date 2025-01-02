import { useEffect, useState } from 'react';
import { fetchMembers } from '../services/memberService';
import { fetchUsers } from '../services/userService';
import { fetchHousehold } from '../services/householdService';
import { IHousehold } from '../models/IHousehold';
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';
import "../styles/main.scss";

interface OverviewProps {
  householdId: string;
  userId: string;
  navigateToTasks: () => void;
}

export const Overview = ({ householdId, userId, navigateToTasks }: OverviewProps) => {
  const [users, setUsers] = useState<IUser[]>([]);
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

        const user = usersData.find((user) => user.user_id === userId);
        if (user) {
          setUserPoints(user.total_points || 0); 
        } else {
          setUserPoints(0); 
          console.error('User not found');
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

  return (
    <div className='overview'>
      <h2>Household:</h2>
      <h3>{household ? `${household.name}` : 'No household found'}</h3>
      <h2>Your Points:</h2>
      <h3>{userPoints !== null ? `${userPoints} p` : 'Points not found'}</h3>
      <h2>Household members:</h2>
      <ul className="members-list">
        {householdUsers.map(user => (
          <h3 key={user.user_id}>{user.username}</h3>
        ))}
      </ul>
      <h2>Tasks:</h2>
      <h4>Get Things Done!</h4>
      <button onClick={navigateToTasks}>Go to Tasks</button>
    </div>
  );
};