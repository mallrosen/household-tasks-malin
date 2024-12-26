import { useEffect, useState } from 'react';
import { useUserAndTasks } from '../hooks/useUserAndTasks';
import { useTaskHandlers } from '../hooks/useTaskHandlers';
import { AddTaskForm } from '../components/AddTaskForm';
import { fetchTasksForHousehold } from '../services/superbaseService';
import { supabase } from '../services/supabaseClient';
import "../styles/main.scss";
import { TaskList } from '../components/TaskList';

export const Tasks = () => {
  const {
    memberId,
    taskList,
    setTaskList,
    userPoints,
    setUserPoints,
    error,
    setError,
  } = useUserAndTasks();

  const [householdId, setHouseholdId] = useState<string | null>(null);

  const { toggleTaskCompletion, removeTask } = useTaskHandlers(
    householdId,
    taskList,
    setTaskList,
    userPoints,
    setUserPoints,
    setError,
    error,
    memberId
  );

  useEffect(() => {
    const fetchHouseholdAndTasks = async () => {
      if (!memberId) return;

      try {
        const { data: memberData, error: memberError } = await supabase
          .from('Members')
          .select('household_id')
          .eq('member_id', memberId)
          .single();

        if (memberError || !memberData) {
          setError('Error fetching household ID');
          return;
        }

        setHouseholdId(memberData.household_id);

        const tasks = await fetchTasksForHousehold(memberData.household_id);
        if (tasks.length > 0) {
          setTaskList(tasks);
        } else {
          setError('No tasks found for household');
        }
      } catch (error) {
        setError('Error fetching data: ' + (error as Error).message);
      }
    };

    fetchHouseholdAndTasks();
  }, [memberId, setTaskList, setError, householdId]);

  const handleSubmit = async (task: { name: string; difficulty: number; points: number }) => {
    if (!memberId) {
      setError('Member ID is missing!');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Tasks')
        .insert({
          name: task.name,
          difficulty: task.difficulty,
          points: task.points,
          status: false,
          member_id: memberId,
        })
        .select();

      if (error) {
        setError('Error adding task: ' + error.message);
      } else if (data) {
        setTaskList((prevTaskList) => [...prevTaskList, data[0]]);
      }
    } catch (error) {
      setError('Error adding task: ' + (error as Error).message);
    }
  };

  if (!householdId || !taskList) {
    return <div>Loading tasks...</div>;
  }

  return (
    <>
      <div>
        <TaskList
          tasks={taskList}
          onToggle={toggleTaskCompletion}
          onRemove={removeTask}
        />

        <div className='addTaskForm'>
          <AddTaskForm handleSubmit={handleSubmit} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </>
  );
};
