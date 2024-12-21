import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ITask } from '../models/ITask';

export const useUserAndTasks = () => {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<ITask[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await supabase.auth.getSession();
        const userId = session?.data?.session?.user?.id;
        
        if (!userId) return;

        const { data: memberData, error: memberError } = await supabase
          .from('Members')
          .select('member_id, household_id, user_id')
          .eq('user_id', userId)
          .single();

        if (memberError || !memberData) {
          setError('Error fetching member data: ' + memberError?.message);
          return;
        }

        setMemberId(memberData.member_id);
        setHouseholdId(memberData.household_id);


        const { data: userData, error: pointsError } = await supabase
          .from('Users')
          .select('total_points')
          .eq('user_id', userId)
          .single();

        if (!pointsError && userData) {
          setUserPoints(userData.total_points || 0);
        }
      } catch (error) {
        setError('Error fetching user data: ' + (error as Error).message);
      }
    };

    const fetchTasks = async () => {
      if (!memberId) return;

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
    fetchUserData();
    fetchTasks();
  }, [memberId]); 

  return {
    memberId,
    householdId,
    taskList,
    userPoints,
    error,
    setTaskList,
    setError,
    setUserPoints,
  };
};