import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ITask } from '../models/ITask';
import { fetchTasks } from '../services/taskService'; // Importera fetchTasks från taskService

export const useUserAndTasks = () => {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<ITask[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);


  const fetchUserData = async () => {
    try {
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id;

      if (!userId) {
        setError('No user found');
        return;
      }

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
        .select('total_points, weekly_points')
        .eq('user_id', userId)
        .single();

      if (pointsError || !userData) {
        setError('Error fetching user points: ' + pointsError?.message);
        return;
      }

      setUserPoints(userData.total_points || 0);
    } catch (error) {
      setError('Error fetching user data: ' + (error as Error).message);
    }
  };

  const fetchTasksForHousehold = async () => {
    if (!householdId) return;

    try {
      const { data: members, error: membersError } = await supabase
        .from('Members')
        .select('member_id')
        .eq('household_id', householdId);

      if (membersError) {
        setError('Error fetching members: ' + membersError.message);
        return;
      }

      if (members && members.length > 0) {
        const memberIds = members.map(member => member.member_id);

        const tasks = await Promise.all(
          memberIds.map(memberId => fetchTasks(memberId))
        );

        const allTasks = tasks.flat();
        setTaskList(allTasks);
      }
    } catch (error) {
      setError('Error fetching tasks: ' + (error as Error).message);
    }
  };


  useEffect(() => {
   
    if (householdId) {
      fetchTasksForHousehold();
    }
     fetchUserData();
  }, [householdId]);

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


// import { useState, useEffect } from 'react';
// import { supabase } from '../services/supabaseClient';
// import { ITask } from '../models/ITask';

// export const useUserAndTasks = () => {
//   const [memberId, setMemberId] = useState<string | null>(null);
//   const [taskList, setTaskList] = useState<ITask[]>([]);
//   const [userPoints, setUserPoints] = useState<number>(0);
//   const [error, setError] = useState<string | null>(null);
//   const [householdId, setHouseholdId] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const session = await supabase.auth.getSession();
//         const userId = session?.data?.session?.user?.id;

//         if (!userId) {
//           setError('No user found');
//           return;
//         }

//         const { data: memberData, error: memberError } = await supabase
//           .from('Members')
//           .select('member_id, household_id, user_id')
//           .eq('user_id', userId)
//           .single();

//         if (memberError || !memberData) {
//           setError('Error fetching member data: ' + memberError?.message);
//           return;
//         }

//         setMemberId(memberData.member_id);
//         setHouseholdId(memberData.household_id);

//         const { data: userData, error: pointsError } = await supabase
//           .from('Users')
//           .select('total_points, weekly_points')
//           .eq('user_id', userId)
//           .single();

//         if (pointsError || !userData) {
//           setError('Error fetching user points: ' + pointsError?.message);
//           return;
//         }

//         setUserPoints(userData.total_points || 0);
//       } catch (error) {
//         setError('Error fetching user data: ' + (error as Error).message);
//       }
//     };

//     const fetchTasks = async () => {
//       if (!householdId) return;
  
//       try {
//         // Hämta alla medlemmar i hushållet
//         const { data: members, error: membersError } = await supabase
//           .from('Members')
//           .select('member_id')
//           .eq('household_id', householdId);
  
//         if (membersError) {
//           setError('Error fetching members: ' + membersError.message);
//           return;
//         }
  
//         if (members && members.length > 0) {
//           const memberIds = members.map(member => member.member_id);
  
//           // Hämta uppgifter för alla medlemmar i hushållet
//           const { data: tasks, error: tasksError } = await supabase
//             .from('Tasks')
//             .select('*')
//             .in('member_id', memberIds);
  
//           if (tasksError) {
//             setError('Error fetching tasks: ' + tasksError.message);
//           } else {
//             setTaskList(tasks || []);
//           }
//         }
//       } catch (error) {
//         setError('Error fetching tasks: ' + (error as Error).message);
//       }
//     };
  
//     fetchUserData();
//     fetchTasks();
//   }, [householdId]);

//   return {
//     memberId,
//     householdId,
//     taskList,
//     userPoints,
//     error,
//     setTaskList,
//     setError,
//     setUserPoints,
//   };
// };