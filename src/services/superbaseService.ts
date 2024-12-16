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



export const fetchHousehold = async (userId: string): Promise<IHousehold[] | null> => {
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
};

export const fetchTasksByHousehold = async (householdId: string) => {
  const { data, error } = await supabase
    .from('Tasks')
    .select(`
      *,
      Members!inner(household_id)
    `)
    .eq('Members.household_id', householdId);

  if (error) {
    console.error('Error fetching tasks for household:', error.message);
    return null;
  }

  return data;
};


export const fetchHouseholdName = async (householdId: string): Promise<IHousehold[]> => {
  const { data, error } = await supabase
    .from('Household')
    .select('household_id, name, created_at, created_by, is_active')
    .eq('household_id', householdId);

  if (error) {
    console.error('Error fetching household name:', error.message);
    return [];
  }

  return data; 
};


export const fetchMembers = async (householdId: string): Promise<IMembers[]> =>{
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
}




export const getSession = async():Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error fetching session:', error.message);
    return null;
  }

  return data.session;
}


// function setError(arg0: string) {
//   throw new Error('Function not implemented.');
// }

