import { useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ITask } from '../models/ITask';

export const useTaskHandlers = (
  householdId: string | null,
  taskList: ITask[],
  setTaskList: (tasks: ITask[] | ((prevTasks: ITask[]) => ITask[])) => void,
  userPoints: number,
  setUserPoints: (points: number | ((prevPoints: number) => number)) => void,
  setError: (error: string | null) => void,
  error: string | null,
  memberId: string | null
) => {
  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      console.log('Toggling task completion for task:', taskId);
      const task = taskList.find(t => t.task_id === taskId);
      
      if (!task || task.status || task.isProcessing || !memberId) return;

      try {
        setTaskList(prevTasks =>
          prevTasks.map(t =>
            t.task_id === taskId ? { ...t, status: true, isProcessing: true } : t
          )
        );

        const taskPoints = task.points || 0;

        const { error: taskError } = await supabase
          .from('Tasks')
          .update({ status: true })
          .eq('task_id', taskId);

        if (taskError) throw taskError;

        const { data: memberData, error: memberError } = await supabase
          .from('Members')
          .select('user_id')
          .eq('member_id', memberId)
          .single();

        if (memberError) throw memberError;
        
        const userId = memberData.user_id;

        const { data: userData, error: userDataError } = await supabase
          .from('Users')
          .select('total_points')
          .eq('user_id', userId)
          .single();

        if (userDataError) throw userDataError;

        const currentPoints = userData?.total_points || 0;
        const updatedPoints = currentPoints + taskPoints;

        const { error: updateError } = await supabase
          .from('Users')
          .update({ total_points: updatedPoints })
          .eq('user_id', userId);

        if (updateError) throw updateError;

        setUserPoints(updatedPoints);
        
        setTaskList(prevTasks =>
          prevTasks.map(t =>
            t.task_id === taskId ? { ...t, isProcessing: false } : t
          )
        );

      } catch (error) {
        setTaskList(prevTasks =>
          prevTasks.map(t =>
            t.task_id === taskId ? { ...t, status: false, isProcessing: false } : t
          )
        );
        setError('Error completing task: ' + (error as Error).message);
      }
    },
    [taskList, setTaskList, setUserPoints, setError, memberId]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      try {
        const { error } = await supabase
          .from('Tasks')
          .delete()
          .eq('task_id', taskId);

        if (error) throw error;

        setTaskList(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
      } catch (error) {
        setError('Error deleting task: ' + (error as Error).message);
      }
    },
    [setTaskList, setError]
  );

  return { toggleTaskCompletion, removeTask };
};
