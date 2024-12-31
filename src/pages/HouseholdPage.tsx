import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchHouseholdName, fetchMembers, fetchUsers } from '../services/superbaseService';  
import { ChartComponent } from '../components/ChartComponent'; 
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';
import { ITask } from '../models/ITask';
import { supabase } from '../services/supabaseClient';
import "../styles/main.scss";
import { useAuth } from '../context/AuthContext';
import { CompletedTasksList } from '../components/CompletedTasksList';



export const HouseholdPage = () => {
  const { householdId } = useParams<{ householdId: string }>();
  const [members, setMembers] = useState<IMembers[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<ITask[]>([]);
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

    if (session && householdId) {
      fetchHouseholdDetails(householdId);
    }
  }, [session, householdId]);

  const fetchCompletedTasks = async (memberId: string) => {
    try {
      const { data, error } = await supabase
        .from('Tasks')
        .select('*')
        .eq('member_id', memberId)
        .eq('status', true);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
      return [];
    }
  };

  const handleMemberClick = async (memberId: string) => {
    if (selectedMember === memberId) {
      setSelectedMember(null);
      setCompletedTasks([]);
    } else {
      const tasks = await fetchCompletedTasks(memberId);
      setCompletedTasks(tasks);
      setSelectedMember(memberId);
    }
  };

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
          backgroundColor: [
            '#F08080', '#194345', '#366223', '#23294F', '#5C7C7E', 
            '#91B383', '#87CEEB', '#BA55D3', '#008080', '#708090', '#FFB256'
          ],
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
      <div className="header-section">
        <h1 className="household-title">{householdName && householdName[0].toUpperCase() + householdName.slice(1)} - Overview Page</h1>
        <h3 className="points-distribution-title">Points Distribution</h3>
      </div>

      <div className="content-section">
        <div className="chart-container">
          {chartData && <ChartComponent data={chartData} />}
        </div>
        <ul className="members-list">
          {members.map((member) => {
            const user = users.find(user => user.user_id === member.user_id);
            return (
              <li key={member.member_id} className="member-item">
                <button
                  onClick={() => handleMemberClick(member.member_id)}
                  className="member-button"
                >{<span className='memberAndPoints'>
                  {user?.username || 'Unknown User'}
                  {user?.total_points != null && (
                    <span className="points"> - {user.total_points} points</span>
                  )}
                  </span>
                }
                </button>
              </li>
            );
          })}
        </ul>
      </div>
  
      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <CompletedTasksList
              tasks={completedTasks}
              onClose={() => setSelectedMember(null)}
              username={
                users.find(user => user.user_id === selectedMember)?.username ||
                'Unknown User'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}