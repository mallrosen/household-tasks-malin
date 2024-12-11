import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchHousehold, fetchMembers, getSession, fetchUsers } from '../services/superbaseService';
import { IHousehold } from '../models/IHousehold';
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';

export const HouseholdPage = () => {
  const { householdId, memberId } = useParams<{ householdId: string, memberId: string}>(); 
  const [household, setHousehold] = useState<IHousehold | null>(null);
  const [members, setMembers] = useState<IMembers[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userIsMember, setUserIsMember] = useState(false);

  useEffect(() => {
    console.log('Household ID:', householdId);
    console.log('Member ID:', memberId);

    const fetchHouseholdData = async () => {
      if (!householdId) {
        setError('Household ID is missing');
        return;
      }
  
      try {
        const session = await getSession();
        const userId = session?.user?.id;

        if (!userId) {
          setError('You must be logged in to view household data.');
          return;
        }

        const householdData = await fetchHousehold(userId);

        if (!householdData || householdData.length === 0) {
          setError('No household found or you are not a member of any household.');
          return;
          
        }
   

        const matchedHousehold = householdData.find(h => h.household_id === householdId);

        if (!matchedHousehold) {
          setError('Household does not exist or you are not a member.');
          return;
        }

        setHousehold(matchedHousehold);

        const membersData = await fetchMembers(householdId);

        if (!membersData || membersData.length === 0) {
          setError('No members found for this household.');
          return;
        }

        setMembers(membersData);

        if (membersData.some(member => member.user_id === userId)) {
          setUserIsMember(true);
        } else {
          setUserIsMember(false);
        }

        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        setError('Error fetching data: ' + (error as Error).message);
      }
    };

    fetchHouseholdData();
  }, [householdId]);

  const getUsername = (userId: string): string => {
    const user = users.find(user => user.user_id === userId);
    return user ? user.username : 'Unknown user';
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!userIsMember) {
    return <div>You are not a member of this household.</div>;
  }

  return (
    <div>
      <h1>Household Information</h1>
      <h2>{household ? `Household: ${household.name}` : 'No household found'}</h2>
      <h3>Members:</h3>
      <ul>
        {members.map(member => (
          <li key={member.member_id}>{getUsername(member.user_id)}</li>
        ))}
      </ul>
    </div>
  );
};
