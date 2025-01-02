import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { getMembersAndPoints } from '../services/memberService';
import { getParticipants } from '../services/userService';
import { IMembers, Participant } from '../models/IMembers';

export const useWeeklyCompetition = (householdId: string | null) => {
  const [members, setMembers] = useState<IMembers[]>([]);
  const [isCompetitionActive, setIsCompetitionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [winner, setWinner] = useState<IMembers[] | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);

  let currentTimer: ReturnType<typeof setInterval> | null = null;

  const checkActiveCompetition = async (householdId: string) => {
    const { data, error } = await supabase
      .from('WeeklyCompetition')
      .select('*')
      .eq('is_active', true)
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking competition:', error);
      return null;
    }

    return data?.[0] || null;
  };

  const startTimer = (endTime: Date) => {
    if (currentTimer) clearInterval(currentTimer);

    currentTimer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance <= 0) {
        clearInterval(currentTimer!);
        currentTimer = null;
        determineWinner();
        setTimeRemaining('');
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
  };

  const determineWinner = async () => {
    if (!householdId) return;
  
    const { data: winners, error } = await supabase.rpc('get_top_participants', {
      _household_id: householdId,
    });
  
    if (error || !winners?.length) {
      console.error('Error determining winners:', error);
      return;
    }
  
    setWinner(winners);
    setShowWinner(true);
    saveWinners(winners);
  
    // Avsluta tävlingen
    await supabase
      .from('WeeklyCompetition')
      .update({ is_active: false })
      .eq('household_id', householdId)
      .eq('is_active', true);
  
    // Nollställ weekly_points för alla medlemmar
    await resetMemberPoints(members);
  
    setIsCompetitionActive(false);
  };
  // const determineWinner = async () => {
  //   if (!householdId) return;

  //   const { data: winners, error } = await supabase.rpc('get_top_participants', {
  //     _household_id: householdId,
  //   });

  //   if (error || !winners?.length) {
  //     console.error('Error determining winners:', error);
  //     return;
  //   }

  //   setWinner(winners);
  //   setShowWinner(true);
  //   saveWinners(winners);

  //   await supabase
  //     .from('WeeklyCompetition')
  //     .update({ is_active: false })
  //     .eq('household_id', householdId)
  //     .eq('is_active', true);

  //   await resetMemberPoints(members);
  //   setIsCompetitionActive(false);
  // };

  const saveWinners = (winners: IMembers[]) => {
    localStorage.setItem('winners', JSON.stringify(winners));
    localStorage.setItem('showWinner', 'true');
  };

  const resetFunction = () => {
    setShowWinner(false);
    setWinner(null);
    localStorage.removeItem('winners');
    localStorage.removeItem('showWinner');
  };

  const resetMemberPoints = async (members: IMembers[]): Promise<void> => {
    const resetPromises = members.map(async (member) => {
      try {
        const { error } = await supabase
          .from('Users')
          .update({ weekly_points: 0 })
          .eq('user_id', member.user_id);

        if (error) {
          console.error('Error resetting points for user:', member.user_id, error);
        }
      } catch (error) {
        console.error('Error resetting points:', error);
      }
    });

    await Promise.all(resetPromises);
  };

  const startWeeklyCompetition = async (householdId: string) => {
    await resetMemberPoints(members);
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 vecka
    // const endTime = new Date(Date.now() + 30 * 1000).toISOString(); // 30 sekunder (test)

    try {
      const { data: members, error: membersError } = await supabase
        .from('Members')
        .select('member_id, user_id')
        .eq('household_id', householdId);

      if (membersError || !members?.length) throw new Error('No members found');

      const participantIds = members.map((member) => member.user_id);

      await supabase
        .from('WeeklyCompetition')
        .insert([
          {
            start_time: startTime,
            end_time: endTime,
            is_active: true,
            household_id: householdId,
            participant_ids: participantIds,
          },
        ]);

      setIsCompetitionActive(true);
      startTimer(new Date(endTime));

      const participantsData = await getParticipants(householdId);
      setParticipants(participantsData || []);
    } catch (error) {
      console.error('Error starting competition:', error);
    }
    resetMemberPoints(members);
    resetFunction();
  };

  const endCompetition = async () => {
    if (!householdId) return;

    await supabase
      .from('WeeklyCompetition')
      .update({ is_active: false })
      .eq('household_id', householdId)
      .eq('is_active', true);

    await determineWinner();
    setIsCompetitionActive(false);
    if (currentTimer) clearInterval(currentTimer);
    setTimeRemaining('');
    resetMemberPoints(members);
  };

  const restartCompetition = async () => {
    if (!householdId) return;

    await resetMemberPoints(members);
    resetFunction();
    await startWeeklyCompetition(householdId);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (householdId) {
        try {
          setIsLoading(true);
          const activeCompetition = await checkActiveCompetition(householdId);

          if (activeCompetition) {
            setIsCompetitionActive(true);
            startTimer(new Date(activeCompetition.end_time));
          }

          const [participantsData, membersData] = await Promise.all([
            getParticipants(householdId),
            getMembersAndPoints(householdId),
          ]);

          setParticipants(participantsData || []);
          setMembers(membersData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const savedWinners = localStorage.getItem('winners');
    const savedShowWinner = localStorage.getItem('showWinner');

    if (savedWinners && savedShowWinner === 'true') {
      setWinner(JSON.parse(savedWinners));
      setShowWinner(true);
    }

    fetchData();
  }, [householdId]);

  return {
    members,
    isCompetitionActive,
    timeRemaining,
    winner,
    showWinner,
    isLoading,
    participants,
    startWeeklyCompetition,
    endCompetition,
    restartCompetition,
    resetFunction,
  };
};