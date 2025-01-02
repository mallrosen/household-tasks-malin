import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMembers } from '../services/memberService';
import { fetchUsers } from '../services/userService';
import { fetchHouseholdName } from '../services/householdService';
import { IMembers } from '../models/IMembers';
import { IUser } from '../models/IUser';
import { useAuth } from '../context/AuthContext';

export const useHouseholdData = () => {
  const { householdId } = useParams<{ householdId: string }>();
  const [members, setMembers] = useState<IMembers[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    const fetchHouseholdDetails = async (householdId: string) => {
      try {
        const householdNameData = await fetchHouseholdName(householdId);
        setHouseholdName(householdNameData && householdNameData[0]?.name || null);

        const memberData = await fetchMembers(householdId);
        setMembers(memberData);

        const userData = await fetchUsers();
        setUsers(userData);
      } catch (err) {
        setError('Error fetching household data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session && householdId) {
      fetchHouseholdDetails(householdId);
    }
  }, [session, householdId]);

  return {
    members,
    users,
    error,
    loading,
    householdName,
  };
};