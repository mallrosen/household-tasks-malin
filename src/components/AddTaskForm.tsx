import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getSession } from '../services/superbaseService';  // Du kan hämta sessionen från superbaseService

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
  const [userId, setUserId] = useState<string | null>(null); // För användarens ID


  useEffect(() => {
    const fetchUserId = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      } else {
        setError('User is not logged in.');
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!householdId || !userId) {
      console.error('Household ID is missing!');
      return;
    }

    if (!userId) {
      console.error('User is not logged in!');
      return;
    }

    const { data, error } = await supabase
      .from('Tasks')
      .insert({
        name: task.name,
        difficulty: task.difficulty,
        points: task.points,
        status: false, 
        household_id: householdId, 
        member_id: userId,  
      });

    if (error) {
      setError('Error adding task: ' + error);
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
