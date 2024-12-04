import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!householdId) {
      console.error('Household ID is missing!');
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
        member_id: null, 
      });

    if (error) {
      console.error('Error adding task:', error.message);
    } else {
      console.log('Task added successfully:', data);
      setTask({ name: '', difficulty: 1, points: 10 }); 
    }
  };

  return (
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
  );
};
