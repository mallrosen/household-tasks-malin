import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { getSession } from '../services/superbaseService';

interface TasksProps {
  name: string;
  difficulty: number;
  points: number;
}

interface AddTaskFormProps {
  householdId: string | undefined;  
}

export const AddTaskForm = ({ householdId }: AddTaskFormProps) => {
  const [task, setTask] = useState<TasksProps>({
    name: '',
    difficulty: 1,
    points: 10,
  });
  const [error, setError] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserIdAndMemberId = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('Members')
          .select('member_id')
          .eq('user_id', session.user.id)
          .eq('household_id', householdId)
          .single();  

        if (error) {
          setError('Error fetching member info: ' + error.message);
        } else if (data) {
          setMemberId(data.member_id);
        }
      } else {
        setError('User is not logged in.');
      }
    };

    fetchUserIdAndMemberId();
  }, [householdId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!householdId || !memberId) {
      console.error('Household ID or Member ID is missing!');
      return;
    }

    const { data, error } = await supabase
      .from('Tasks')
      .insert({
        name: task.name,
        difficulty: task.difficulty,
        points: task.points,
        status: false,
        member_id: memberId,
      });

    if (error) {
      setError('Error adding task: ' + error.message);
    } else {
      console.log('Task added successfully:', data);
      setTask({ name: '', difficulty: 1, points: 10 });
    }
  };

  return (
    <div>
      <h3>Add Task</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Task Name</label>
          <input
            type="text"
            value={task.name}
            onChange={(e) => setTask({ ...task, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Difficulty</label>
          <input
            type="number"
            value={task.difficulty}
            min="1"
            max="3"
            onChange={(e) =>
              setTask({ ...task, difficulty: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <div>
          <label>Points</label>
          <input
            type="number"
            value={task.points}
            onChange={(e) => setTask({ ...task, points: parseInt(e.target.value) })}
            required
          />
        </div>
        <button type="submit">Add Task</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
