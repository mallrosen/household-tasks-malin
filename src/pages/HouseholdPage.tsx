import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchHouseholdName, fetchMembers, fetchUsers, getSession } from '../services/superbaseService';  
import { ChartComponent } from '../components/ChartComponent'; 
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';


import '../styles/HouseholdPage.scss';
import { useAuth } from '../context/AuthContext';

export const HouseholdPage = () => {
  const { householdId } = useParams<{ householdId: string }>();
  const [members, setMembers] = useState<IMembers[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchHouseholdDetails = async (householdId: string) => {
      try {
        const householdNameData = await fetchHouseholdName(householdId);
        setHouseholdName(householdNameData && householdNameData[0]?.name || null);

        const memberData = await fetchMembers(householdId); 
        setMembers(memberData);

        const userData = await fetchUsers(); 
        setUsers(userData);

        const chartData = generateChartData(memberData, userData);
        setChartData(chartData);
      } catch (err) {
        setError('Error fetching household data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session &&  householdId) {
      fetchHouseholdDetails(householdId);
    }
  }, [session, householdId]);


  const generateChartData = (members: IMembers[], users: IUser[]) => {
    const labels: string[] = [];
    const data: number[] = [];

    members.forEach(member => {
      const user = users.find(u => u.user_id === member.user_id);
      if (user) {
        labels.push(user.username || 'Unknown');
        data.push(user.total_points || 0);  
      }
    });
    

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#4CAF50'],
        },
      ],
    };
  };

  if (loading) {
    return <div>Loading household data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="household-page">
      <h1>{householdName || 'Loading household name...'}</h1> 
      <h3>Members</h3>
      <ul className="members-list">
        {members.map((member) => (
          <li key={member.member_id} className="member-item">
            {users.find(user => user.user_id === member.user_id)?.username || 'Unknown User'}
          </li>
        ))}
      </ul>
      <h3>Points Distribution</h3>
      {chartData && <ChartComponent data={chartData} />}
    </div>
  );
};


