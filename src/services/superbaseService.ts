import { Session } from '@supabase/supabase-js';
import { IHousehold } from '../models/IHousehold';
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';
import { supabase } from './supabaseClient';


export async function fetchUsers(): Promise<IUser[]> {
  const { data, error } = await supabase.from('Users').select('*');
  if (error) {
    console.error('Error fetching users:', error.message);
    return [];
  }
  return data;
}

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

export const fetchHousehold = async (userId: string): Promise<IHousehold[] | null> => {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('Members')
      .select('household_id')
      .eq('user_id', userId)
      .single();

    if (memberError) {
      console.error('Error fetching household ID from Members:', memberError.message);
      return null;
    }

    if (memberData) {
      const { data: householdData, error: householdError } = await supabase
        .from('Household')
        .select('*')
        .eq('household_id', memberData.household_id);

      if (householdError) {
        console.error('Error fetching household data:', householdError.message);
        return null;
      }

      return householdData;
    }

    console.error('No household found for the given user ID');
    return null;
  } catch (error) {
    console.error('Error fetching household:', error);
    return null;
  }
};

export const fetchHouseholdName = async (householdId: string): Promise<IHousehold[]> => {
  try {
    const { data, error } = await supabase
      .from('Household')
      .select('household_id, name, created_at, created_by, is_active')
      .eq('household_id', householdId);

    if (error) {
      console.error('Error fetching household name:', error.message);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching household name:', error);
    return [];
  }
};

export const fetchMembers = async (householdId: string): Promise<IMembers[]> => {
  try {
    const { data, error } = await supabase
      .from('Members')
      .select('member_id, user_id, household_id, Users(username, total_points)')
      .eq('household_id', householdId);

    if (error) {
      console.error('Error fetching members:', error.message);
      return [];
    }

    return data.map(member => ({
      member_id: member.member_id,
      user_id: member.user_id,
      household_id: member.household_id,
      username: member.Users?.[0]?.username || 'Unknown User',
      total_points: member.Users?.[0]?.total_points || 0,
    }));
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

export const fetchTasks = async (memberId: string) => {
  try {
    const { data, error } = await supabase
      .from('Tasks')
      .select('*')
      .eq('member_id', memberId); 

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

export const getSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error.message);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
};
