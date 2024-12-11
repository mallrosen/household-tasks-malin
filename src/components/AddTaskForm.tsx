import { FormEvent, useState } from 'react';

interface Task {
  task_id: string;
  name: string;
  difficulty: number;
  points: number;
  status: boolean; 
  member_id: string;
}

interface AddTaskFormProps {
  handleSumbit: (task: Task) => void;
}

export const AddTaskForm = ({handleSumbit}: AddTaskFormProps) => {
  const [task, setTask] = useState({
    task_id: '',
    name: '',
    difficulty: 1,
    points: 10,
    status: false,
    member_id: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSumbit(task);
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
            onChange={(e) => setTask({ ...task, difficulty: parseInt(e.target.value) })}
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
    </div>
  );
};


