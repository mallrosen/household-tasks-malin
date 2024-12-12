import { useEffect } from 'react';
import { useUserAndTasks } from '../hooks/useUserAndTasks'; 
import { supabase } from '../services/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { AddTaskForm } from '../components/AddTaskForm';
import { fetchTasks, getSession } from '../services/superbaseService';

export const Tasks = () => {
  const { memberId, taskList, setTaskList, userPoints, setUserPoints, error, setError } = useUserAndTasks();

  useEffect(() => {
    const fetchTasksForMember = async () => {
      if (!memberId) return;

      const tasks = await fetchTasks(memberId);
      if (tasks) {
        setTaskList(tasks);
      } else {
        setError('Error fetching tasks');
      }
    };

    fetchTasksForMember();
  }, [memberId, setTaskList, taskList]);

  const handleRemove = async (taskId: string) => {
    try {
      console.log('Attempting to delete task with ID:', taskId);
      const { error } = await supabase
        .from('Tasks')
        .delete()
        .eq('task_id', taskId);

      if (error) {
        console.error('Error deleting task:', error.message);
        setError('Error deleting task: ' + error.message);
      } else {
        console.log('Task deleted successfully from database');
        setTaskList((prevTaskList) => prevTaskList.filter((task) => task.task_id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', (error as Error).message);
      setError('Error deleting task: ' + (error as Error).message);
    }
  };
  
  const handleSubmit = async (task: { name: string; difficulty: number; points: number; status: boolean; member_id: string }) => {
    if (!memberId) {
      setError('Member ID is missing!');
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
        setTaskList((prevTaskList) => [...prevTaskList, data[0]]);
      }
    }
  };



  const toggleTaskCompletion = async (taskId: string) => {
    const task = taskList.find(t => t.task_id === taskId);
    if (!task || task.status) return; 
    try {
      const { data: taskUpdateData, error: taskUpdateError } = await supabase
        .from('Tasks')
        .update({ status: true })
        .eq('task_id', taskId)
        .single();
  
      if (taskUpdateError) {
        setError('Error updating task: ' + taskUpdateError.message);
        return;
      }
  
      console.log('Task completed:', taskUpdateData);
  
      setTaskList(prevTaskList =>
        prevTaskList.map(t => t.task_id === taskId ? { ...t, status: true } : t)
      );
  
      const session = await getSession();
      const userId = session?.user?.id;
  
      if (userId) {
        const updatedPoints = userPoints + (task?.points || 0); 
  
        const { error: pointsUpdateError } = await supabase
          .from('Users')
          .update({ total_points: updatedPoints })
          .eq('user_id', userId);
  
        if (pointsUpdateError) {
          setError('Error updating user points: ' + pointsUpdateError.message);
          return;
        }
  
        console.log('User points updated successfully.');
        setUserPoints(updatedPoints); 
      }
    } catch (error) {
      setError('Error completing task: ' + (error as Error).message);
    }
  };
  
  if (!memberId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Tasks</h2>
      <ul>
        {taskList.map(task => (
          <li key={task.task_id}>
            <span style={{ textDecoration: task.status ? 'line-through' : 'none' }}>
              {task.name} (Difficulty: {task.difficulty}, Points: {task.points})
              <button onClick={() => handleRemove(task.task_id)}><FontAwesomeIcon icon={faTrash} /></button>
            </span>
            {!task.status && (
              <button onClick={() => toggleTaskCompletion(task.task_id)}>Complete</button>
            )}
          </li>
        ))}
      </ul>
      <AddTaskForm handleSubmit={handleSubmit} />
    </div>
  );
};