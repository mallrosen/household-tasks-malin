import { supabase } from './supabaseClient';

export const fetchTasksByMember = async (memberId: string) => {
  try {
    const { data, error } = await supabase
      .from('Tasks')
      .select('*')
      .eq('member_id', memberId);

    if (error) {
      console.error('Error fetching tasks for member:', error.message);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching tasks for member:', error);
    return [];
  }
};

export const fetchTasksForHousehold = async (householdId: string) => {
  try {
    const { data: members, error: membersError } = await supabase
      .from('Members')
      .select('member_id')
      .eq('household_id', householdId);

    if (membersError) {
      console.error('Error fetching members for household:', membersError.message);
      return [];
    }

    if (members && members.length > 0) {
      const memberIds = members.map(member => member.member_id);

      const { data: tasks, error: tasksError } = await supabase
        .from('Tasks')
        .select('*')
        .in('member_id', memberIds);

      if (tasksError) {
        console.error('Error fetching tasks for household members:', tasksError.message);
        return [];
      }

      return tasks || [];
    }

    console.error('No members found for the given household ID');
    return [];
  } catch (error) {
    console.error('Error fetching tasks for household:', error);
    return [];
  }
};

export const fetchTasks = async (memberId: string) => {
  try {
    const { data, error } = await supabase
      .from('Tasks')
      .select('*')
      .eq('member_id', memberId)
      .eq('deleted', false); // Här filtrerar vi bort borttagna uppgifter

    if (error) {
      console.error('Error fetching tasks:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};