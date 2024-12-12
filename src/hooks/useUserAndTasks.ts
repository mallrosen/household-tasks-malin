import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ITask } from '../models/ITask';

export const useUserAndTasks = () => {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<ITask[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserIdAndMemberId = async () => {
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id;

      if (!userId) return;

      const { data: memberData, error: memberError } = await supabase
        .from('Members')
        .select('member_id')
        .eq('user_id', userId)
        .single();

      if (memberError || !memberData) {
        setError('Error fetching member ID: ' + memberError?.message);
        return;
      }

      setMemberId(memberData.member_id);
      fetchTasksForMember(memberData.member_id);
    };

    const fetchTasksForMember = async (memberId: string) => {
      try {
        const { data: tasks, error } = await supabase
          .from('Tasks')
          .select('*')
          .eq('member_id', memberId);

        if (error) {
          setError('Error fetching tasks: ' + error.message);
        } else {
          setTaskList(tasks || []);
        }
      } catch (error) {
        setError('Error fetching tasks: ' + (error as Error).message);
      }
    };

    fetchUserIdAndMemberId();
  }, []);

  return { memberId, taskList, userPoints, error, setTaskList, setError, setUserPoints };
};