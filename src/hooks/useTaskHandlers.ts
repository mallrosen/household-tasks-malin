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
      const task = taskList.find(t => t.task_id === taskId);
  
      if (!task || task.status || task.isProcessing || !memberId) return;
  
      setTaskList(prevTasks =>
        prevTasks.map(t =>
          t.task_id === taskId ? { ...t, status: true, isProcessing: true } : t
        )
      );
  
      try {
        const taskPoints = task.points || 0;
  
        const { error: updateError } = await supabase.rpc('complete_task_and_update_points', {
          task_id: taskId,
          member_id: memberId,
          points: taskPoints,
        });
  
        if (updateError) throw updateError;
  
        setUserPoints(prevPoints => prevPoints + taskPoints);
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
          .eq('task_id', taskId)

        if (error) throw error;

        setTaskList(prevTasks => prevTasks.filter(task => task.task_id !== taskId));
      } catch (error) {
        setError('Error deleting task: ' + (error as Error).message);
      }
    },
    [householdId, setTaskList, setError, memberId]
  );

  return { toggleTaskCompletion, removeTask };
};