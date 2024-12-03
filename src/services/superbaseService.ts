import { IHousehold } from '../models/IHousehold';
import { IMembers } from '../models/IMembers';
import { ITask } from '../models/ITask';
import { IUser } from '../models/IUser';
import { supabase } from '../supabaseClient';

// Hämta användare
export async function fetchUsers() : Promise<IUser[]>{
  const { data, error } = await supabase.from('Users').select('*');
  if (error) {
    console.error('Error fetching users:', error.message);
    return [];
  }
  return data;
}

// Hämta uppgifter
export async function fetchTasks() : Promise<ITask[]>{
  const { data, error } = await supabase.from('Tasks').select('*');
  if (error) {
    console.error('Error fetching tasks:', error.message);
    return [];
  }
  return data;
}

// Hämta hushåll
export async function fetchHousehold(userId: string): Promise<IHousehold[] | null>{
  const { data, error } = await supabase
    .from('Household')
    .select('*')
    .eq('user_id', userId);  // Filtrera efter user_id
  if (error) {
    console.error('Error fetching household:', error.message);
    return null;
  }
  return data;
}

// Hämta medlemmar
export async function fetchMembers(householdId: string) : Promise<IMembers[]>{
  const { data, error } = await supabase
    .from('Members')
    .select('member_id, user_id, household_id')
    .eq('household_id', householdId);  // Filtrera efter household_id
  if (error) {
    console.error('Error fetching members:', error.message);
    return [];
  }
  return data;
}
