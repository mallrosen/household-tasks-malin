import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useUsername = (userId: string | null) => {
  const [username, setUsername] = useState<string | null>('');

  useEffect(() => {
    const fetchUsername = async () => {
      if (!userId) return;

      const { data } = await supabase
        .from('Users')
        .select('username')
        .eq('user_id', userId)
        .single();

      if (data) {
        setUsername(data.username);
      } else {
        console.log('No username found');
      }
    };

    fetchUsername();
  }, [userId]);

  return username;
};