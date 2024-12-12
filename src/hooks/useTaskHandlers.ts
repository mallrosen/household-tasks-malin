import { useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ITask } from '../models/ITask';

export const useTaskHandlers = (memberId: string | null, userPoints: number, setTaskList: any, setUserPoints: any, setError: any) => {
  const toggleTaskCompletion = useCallback(async (taskId: string, taskPoints: number) => {
    if (!memberId) return;

    try {
      const { data, error } = await supabase
        .from('Tasks')
        .update({ status: true })
        .eq('task_id', taskId)
        .single();

      if (error) {
        setError('Error updating task: ' + error.message);
        return;
      }

      setTaskList((prevTasks: ITask[]) =>
        prevTasks.map(task => (task.task_id === taskId ? { ...task, status: true } : task))
      );

      const newPoints = userPoints + taskPoints;
      const session = await supabase.auth.getSession();
      const userId = session?.data.session?.user?.id;

      if (userId) {
        const { error: updateError } = await supabase
          .from('Users')
          .update({ total_points: newPoints })
          .eq('user_id', userId);

        if (updateError) {
          setError('Error updating user points: ' + updateError.message);
        } else {
          setUserPoints(newPoints);
        }
      }
    } catch (e) {
      setError('Error completing task: ' + (e as Error).message);
    }
  }, [memberId, userPoints, setTaskList, setUserPoints, setError]);

  const removeTask = useCallback(async (taskId: string) => {
    if (!memberId) return;

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
    } catch (e) {
      setError('Error deleting task: ' + (e as Error).message);
    }
  }, [memberId, setTaskList, setError]);

  return { toggleTaskCompletion, removeTask };
};
