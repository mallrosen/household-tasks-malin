import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChartComponent } from '../components/ChartComponent';
import { useHouseholdData } from '../hooks/useHouseholdData';
import { MembersList } from '../components/MembersList';
import { CompletedTasksList } from '../components/CompletedTaskList';
import { supabase } from '../services/supabaseClient';
import { ITask } from '../models/ITask';
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';
import "../styles/main.scss";
import { IChartData } from '../models/IChartData';

export const HouseholdPage = () => {
  const { householdId } = useParams<{ householdId: string }>();
  const { members, users, error, loading, householdName } = useHouseholdData();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<ITask[]>([]);

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

  const fetchCompletedTasks = async (memberId: string) => {
    try {
      const { data: tasks, error: tasksError } = await supabase
        .from('Tasks')
        .select('*')
        .eq('completed_by', memberId) 
        .eq('status', true)
        .order('completed_at', { ascending: false });

      if (tasksError) throw tasksError;

      return tasks || [];
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
      return [];
    }
  };

  if (loading) {
    return <div>Loading household data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }


const generateChartData = (members: IMembers[], users: IUser[]): IChartData => {
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
        label: '',
        borderColor: ['#fff'],
        borderWidth: 2,
      },
    ],
  };
};

const chartData = generateChartData(members, users)

  return (
    <div className="household-page">
      <div className="header-section">
        <h1 className="household-title">
          {householdName && householdName[0].toUpperCase() + householdName.slice(1)} - Overview Page
        </h1>
        <h3 className="points-distribution-title">Points Distribution</h3>
      </div>

      <div className="content-section">
        <div className="chart-container">
          <ChartComponent data={chartData} />
        </div>
        <MembersList
          members={members}
          users={users}
          selectedMember={selectedMember}
          onMemberClick={handleMemberClick}
        />
      </div>
      {selectedMember && (
        <CompletedTasksList
          tasks={completedTasks}
          onClose={() => setSelectedMember(null)}
          username={
            users.find(user => user.user_id === selectedMember)?.username ||
            'Unknown User'
          }
        />
      )}
    </div>
  );
};
