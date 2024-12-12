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
  handleSubmit: (task: Task) => void;
}

export const AddTaskForm = ({ handleSubmit }: AddTaskFormProps) => {
  const [task, setTask] = useState({
    task_id: '',
    name: '',
    difficulty: 1,
    points: 10,
    status: false,
    member_id: '',
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit(task);
    setTask({
      task_id: '',
      name: '',
      difficulty: 1,
      points: 10,
      status: false,
      member_id: '',
    });
  };

  return (
    <div>
      <h3>Add Task</h3>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="text"
            placeholder="Task Name"
            value={task.name}
            onChange={(e) => setTask({ ...task, name: e.target.value })}
            required
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Difficulty"
            value={task.difficulty}
            onChange={(e) => setTask({ ...task, difficulty: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Points"
            value={task.points}
            onChange={(e) => setTask({ ...task, points: Number(e.target.value) })}
            required
          />
        </div>
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};