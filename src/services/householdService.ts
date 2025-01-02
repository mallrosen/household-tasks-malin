import { IHousehold } from '../models/IHousehold';
import { supabase } from './supabaseClient';

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