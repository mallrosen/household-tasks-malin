import { useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ITask } from '../models/ITask';


export const useTaskHandlers = (
householdId: string | null, taskList: ITask[], setTaskList: (tasks: ITask[] | ((prevTasks: ITask[]) => ITask[])) => void, userPoints: number, setUserPoints: (points: number) => void, setError: (error: string | null) => void, error: string | null) => {
  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
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

        setTaskList(prevTasks =>
          prevTasks.map(t => (t.task_id === taskId ? { ...t, status: true } : t))
        );
  
        const session = await supabase.auth.getSession();
        const userId = session.data.session?.user?.id;
  
        if (userId) {
          const { data: userData, error: userFetchError } = await supabase
            .from('Users')
            .select('total_points')
            .eq('user_id', userId)
            .single();
  
          if (userFetchError) {
            setError('Error fetching user points: ' + userFetchError.message);
            return;
          }
  
          const currentPoints = userData?.total_points || 0;
          const updatedPoints = currentPoints + (task.points || 0);
          const { error: pointsUpdateError } = await supabase
            .from('Users')
            .update({ total_points: updatedPoints })
            .eq('user_id', userId);
  
          if (pointsUpdateError) {
            setError('Error updating user points: ' + pointsUpdateError.message);
            return;
          }
          setUserPoints(updatedPoints); 
        }
      } catch (error) {
        setError('Error completing task: ' + (error as Error).message);
      }
    },
    [taskList, setTaskList, setUserPoints, setError]
  );
  

  const removeTask = useCallback(
    async (taskId: string) => {
      try {
        const { error } = await supabase
          .from('Tasks')
          .delete()
          .eq('task_id', taskId);

        if (error) {
          setError('Error deleting task: ' + error.message);
          return;
        }

        setTaskList((prevTasks: ITask[]) => prevTasks.filter(task => task.task_id !== taskId));
      } catch (error) {
        setError('Error deleting task: ' + (error as Error).message);
      }
    },
    [householdId, setTaskList, setError]
  );

  return { toggleTaskCompletion, removeTask };
};
