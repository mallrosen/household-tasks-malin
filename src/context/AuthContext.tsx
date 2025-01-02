import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession} from '../services/authService'; 
import { fetchHousehold } from '../services/householdService';
import { Session } from '@supabase/supabase-js';
import { IHousehold } from '../models/IHousehold';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  session: Session | null;
  household: IHousehold[] | null;
  loading: boolean;
  userName: string | null;
  setSession: (session: Session | null) => void; 
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [household, setHousehold] = useState<IHousehold[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionData = await getSession();
        setSession(sessionData);
  
        if (sessionData?.user?.id) {

          const householdData = await fetchHousehold(sessionData.user.id);
          setHousehold(householdData);
  

          const { data: subscription } = supabase.auth.onAuthStateChange(async (e, session) => {
            if (session) {
              setSession(session);
              setLoading(true);
  
              const { data: userData, error: userError } = await supabase
                .from('Users')
                .select('username')
                .eq('user_id', session.user.id)  
                .single();
  
              if (userError) {
                console.error('Error fetching user data on session change:', userError.message);
              } else {
                setUserName(userData?.username || null);
              }
            } else {
              setSession(null);
              setUserName(null);
            }
            setLoading(false);
          });
  
          return () => {
            subscription?.subscription?.unsubscribe();
          };
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setLoading(false);
      }
    };
  
    initializeAuth();
  }, []); 

  

  return (
    <AuthContext.Provider value={{ session, household, loading, userName, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

