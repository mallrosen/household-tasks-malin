import { Participant } from '../models/IMembers';
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

export const getParticipants = async (householdId: string): Promise<Participant[]> => {
    try {
      const { data: competition, error: competitionError } = await supabase
        .from('WeeklyCompetition')
        .select('*')
        .eq('household_id', householdId)
        .eq('is_active', true);
  
      if (competitionError || !competition?.length) {
        console.error('Error fetching competition:', competitionError);
        return [];
      }
  
      const participantIds = competition[0].participant_ids;
  
      const { data: participants, error: participantsError } = await supabase
        .from('Users')
        .select('username, weekly_points')
        .in('user_id', participantIds);
  
      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return [];
      }
  
      return participants || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  };