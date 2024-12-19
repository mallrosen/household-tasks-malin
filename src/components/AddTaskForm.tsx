import { ChangeEvent, FormEvent, useState } from 'react';
import "../styles/main.scss";

export const AddTaskForm = ({ handleSubmit }: { handleSubmit: Function }) => {
  const [taskName, setTaskName] = useState('');
  const [difficulty, setDifficulty] = useState('easy'); 
  const [points, setPoints] = useState(10); 
  const [error, setError] = useState('');

  const handleDifficultyChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const difficulty = e.target.value;

    setDifficulty(difficulty);

    if (difficulty === 'easy') {
      setPoints(10);
    } else if (difficulty === 'medium') {
      setPoints(20);
    } else if (difficulty === 'hard') {
      setPoints(30);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!taskName) {
      setError('Task name is required');
      return;
    }

    handleSubmit({ name: taskName, difficulty: difficulty, points: points });
    setTaskName('');
    setError('');
  };

  return (
    <div className="add-task-form">
      <h3>Add New Task</h3>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Add Task"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          required
        />
        
        <select value={difficulty} onChange={handleDifficultyChange}>
          <option value="easy">Easy (10 points)</option>
          <option value="medium">Medium (20 points)</option>
          <option value="hard">Hard (30 points)</option>
        </select>
        
        <button type="submit" className='addTask'>Add Task</button>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};
