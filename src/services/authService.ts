import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

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