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

export const fetchTasks = async (householdId: string) => {
  try {
    const { data, error } = await supabase
      .from('Tasks')
      .select('*')
      .eq('member_id', householdId); 

    if (error) {
      console.error('Error fetching tasks:', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
};

export async function fetchHousehold(userId: string): Promise<IHousehold[] | null> {
  const { data: memberData, error: memberError } = await supabase
    .from('Members')
    .select('household_id')
    .eq('user_id', userId)
    .limit(1); 

  if (memberError) {
    console.error('Error fetching household ID from Members:', memberError.message);
    return null;
  }

  if (memberData && memberData.length > 0) {
    const householdId = memberData[0].household_id;

    const { data: householdData, error: householdError } = await supabase
      .from('Household')
      .select('*')
      .eq('household_id', householdId);

    if (householdError) {
      console.error('Error fetching household data:', householdError.message);
      return null;
    }

    return householdData;
  }

  console.error('No household found for the given user ID');
  return null;
}

export async function fetchMembers(householdId: string): Promise<IMembers[]> {
  const { data, error } = await supabase
    .from('Members')
    .select('member_id, user_id, household_id')
    .eq('household_id', householdId);

  if (error) {
    console.error('Error fetching members:', error.message);
    return [];
  }
  return data;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error.message);
    return null;
  }

  return data.session;
}


