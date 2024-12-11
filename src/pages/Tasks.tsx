import { useEffect, useState } from 'react';
import { AddTaskForm } from "../components/AddTaskForm";
import { fetchTasks, getSession } from '../services/superbaseService';
import { ITask } from '../models/ITask';
import { supabase } from '../services/supabaseClient';

interface TasksProps {
  taskList: ITask[];
  memberId: string;
}

export const Tasks = ({ taskList: initialTaskList }: TasksProps) => {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<ITask[]>(initialTaskList);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserIdAndMemberId = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('Members')
          .select('member_id')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          setError('Error fetching member info: ' + error.message);
        } else if (data) {
          setMemberId(data.member_id);
        }
      } else {
        setError('User is not logged in.');
      }
    };

    const fetchAndSetTasks = async () => {
      if (memberId) {
        const fetchedTasks = await fetchTasks(memberId);
        if (fetchedTasks) {
          setTaskList(fetchedTasks);
        } else {
          setError('Error fetching tasks.');
        }
      }
    };

    fetchUserIdAndMemberId();
    fetchAndSetTasks();
  }, [memberId]);

  const handleSubmit = async (task: { name: string; difficulty: number; points: number; status: boolean; member_id: string }) => {
    if (!memberId) {
      console.error('Member ID is missing!');
      return;
    }

    const { data, error } = await supabase
      .from('Tasks')
      .insert({
        name: task.name,
        difficulty: task.difficulty,
        points: task.points,
        status: false,
        member_id: memberId,
      });

    if (error) {
      setError('Error adding task: ' + error.message);
    } else {
      console.log('Task added successfully:', data);
      if (data) {
        setTaskList([...taskList, data[0]]);
      }
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = taskList.find(t => t.task_id === taskId);
    if (!task || task.status) return; // Om uppgiften redan är klar, gör ingenting.

    const { data, error } = await supabase
      .from('Tasks')
      .update({ status: true }) // Markera som klar
      .eq('task_id', taskId);

    if (error) {
      setError('Error updating task: ' + error.message);
    } else {
      console.log('Task updated successfully:', data);
      if (data) {
        setTaskList(taskList.map(t => t.task_id === taskId ? { ...t, status: true } : t));
      }
    }
  };

  return (
    <div>
      <h2>Tasks</h2>
      <ul>
        {taskList.map(task => (
          <li key={task.task_id}>
            <span style={{ textDecoration: task.status ? 'line-through' : 'none' }}>
              {task.name} (Difficulty: {task.difficulty}, Points: {task.points})
            </span>
            {!task.status && (
              <button onClick={() => toggleTaskCompletion(task.task_id)}>Complete</button>
            )}
          </li>
        ))}
      </ul>
      <AddTaskForm handleSumbit={handleSubmit} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
