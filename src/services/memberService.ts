import { IMembers } from '../models/IMembers';
import { supabase } from './supabaseClient';

export const fetchMembers = async (householdId: string): Promise<IMembers[]> => {
    try {
      const { data, error } = await supabase
        .from('Members')
        .select('member_id, user_id, household_id, role, Users(user_id, username, created_at, updated_at, total_points, weekly_points)')
        .eq('household_id', householdId);
  
      if (error) {
        console.error('Error fetching members:', error.message);
        return [];
      }
  
      return data.map(member => ({
        member_id: member.member_id,
        user_id: member.user_id,
        household_id: member.household_id,
        role: member.role || null,
        Users: member.Users ? member.Users[0] : null, 
        username: member.Users?.[0]?.username || 'Unknown User',
        total_points: member.Users?.[0]?.total_points || 0,
        weekly_points: member.Users?.[0]?.weekly_points || 0,
      }));
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  };
  export const getMembersAndPoints = async (householdId: string): Promise<IMembers[]> => {
    try {
      const { data, error } = await supabase.rpc('get_members_and_points', { household_id: householdId });
  
      if (error) {
        console.error("Error fetching members:", error);
        return [];
      }
  
      return (data || []).map((member: IMembers) => ({
        member_id: member.member_id,
        user_id: member.user_id,
        username: member.username || 'Unknown User',
        total_points: member.total_points || 0,
        household_id: member.household_id,
        Users: member.Users ? [member.Users] : [], 
      }));
    } catch (error) {
      console.error("Error fetching members:", error);
      return [];
    }
  };